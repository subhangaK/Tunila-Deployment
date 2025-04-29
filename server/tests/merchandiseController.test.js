import assert from "assert";

// 1. Create complete mocks for all database models
const mockMerchandise = {
  find: () => ({
    lean: () => Promise.resolve([{ _id: "1", name: "Test Merch" }]),
  }),
  findById: (id) =>
    Promise.resolve(
      id === "nonexistent"
        ? null
        : {
            _id: id,
            name: "Test Item",
            stock: 10,
            save: () => Promise.resolve(),
          }
    ),
  create: () => Promise.resolve({ _id: "123", name: "New Item" }),
};

const mockUser = {
  findById: (id) =>
    Promise.resolve({
      _id: id,
      canSellMerch: id === "artist123",
      merchItems: [],
      wishlist: [],
      save: () => Promise.resolve(),
    }),
};

const mockTransaction = {
  create: () => Promise.resolve({ pidx: "test123" }),
  findOne: () =>
    Promise.resolve({
      status: "initiated",
      merch: { stock: 5, save: () => Promise.resolve() },
      save: () => Promise.resolve(),
    }),
  find: () => Promise.resolve([]),
};

// 2. Mock external services
const mockAxios = {
  post: () => Promise.resolve({ data: { pidx: "test123" } }),
};

const mockTransporter = {
  sendMail: () => Promise.resolve(),
};

// 3. Create test controller with all mocks
const testController = {
  // Controller functions
  createMerchandise: async (req, res) => {
    const user = await mockUser.findById(req.userId);
    if (!user || !user.canSellMerch) {
      return res
        .status(403)
        .json({ message: "Complete artist verification to sell items" });
    }
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one image is required" });
    }
    const merch = await mockMerchandise.create(req.body);
    res.status(201).json(merch);
  },

  getAllMerchandise: async (req, res) => {
    const merch = await mockMerchandise.find().lean();
    res.json(merch);
  },

  initiatePayment: async (req, res) => {
    if (!req.body.merchId || !req.body.quantity || req.body.quantity < 1) {
      return res.status(400).json({ message: "Invalid request data" });
    }
    const merch = await mockMerchandise.findById(req.body.merchId);
    if (!merch)
      return res.status(404).json({ message: "Merchandise not found" });
    if (merch.stock < req.body.quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }
    res.json({ success: true });
  },
};

// 4. Test runner
async function runTest(name, testFn) {
  try {
    await testFn();
    console.log(`✓ ${name}`);
  } catch (err) {
    console.log(`✗ ${name}`);
    console.log(err.message);
  }
}

// 5. Run tests
console.log("Running tests...");

await runTest("Non-artist cannot create merchandise", async () => {
  const req = { userId: "user123", body: {}, files: [] };
  const res = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.data = data;
      return this;
    },
  };
  await testController.createMerchandise(req, res);
  assert.strictEqual(res.statusCode, 403);
});

await runTest("Artist can create merchandise", async () => {
  const req = {
    userId: "artist123",
    body: { name: "Test" },
    files: ["image.jpg"],
  };
  const res = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.data = data;
      return this;
    },
  };
  await testController.createMerchandise(req, res);
  assert.strictEqual(res.statusCode, 201);
});

await runTest("Get all merchandise returns array", async () => {
  const res = {
    json(data) {
      this.data = data;
      return this;
    },
  };
  await testController.getAllMerchandise({}, res);
  assert(Array.isArray(res.data));
});

await runTest("Payment requires valid quantity", async () => {
  const req = {
    userId: "user123",
    body: { merchId: "123" }, // Missing quantity
  };
  const res = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.data = data;
      return this;
    },
  };
  await testController.initiatePayment(req, res);
  assert.strictEqual(res.statusCode, 400);
});

console.log("Tests completed");
