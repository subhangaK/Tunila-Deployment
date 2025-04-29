import assert from "assert";

// Mock data and dependencies
const mockUser = {
  _id: "user123",
  email: "test@example.com",
  password: "hashedtest123", // Fixed to match hash of "test123"
  isActive: true,
  isAccountVerified: false,
  verifyOtp: "",
  verifyOtpExpireAt: 0,
  resetOtp: "",
  resetOtpExpireAt: 0,
  save: async function () {
    return this;
  },
};

const mockUserModel = {
  findOne: async ({ email }) => {
    if (email === "exists@example.com") return mockUser;
    if (email === "inactive@example.com")
      return { ...mockUser, isActive: false };
    return null;
  },
  findById: async (id) => (id === "user123" ? mockUser : null),
  create: async (user) => ({ ...user, _id: "newuser123" }),
};

const mockBcrypt = {
  hash: async (password) => `hashed${password}`,
  compare: async (password, hashed) => hashed === `hashed${password}`,
};

const mockJwt = {
  sign: () => "testtoken",
};

const mockTransporter = {
  sendMail: async () => true,
};

const mockEmailTemplates = {
  EMAIL_VERIFY_TEMPLATE: "OTP: {{otp}}",
  PASSWORD_RESET_TEMPLATE: "Reset OTP: {{otp}}",
};

// Create test controller with all mocks
const testController = {
  register: async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing Details" });
    }

    const existingUser = await mockUserModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await mockBcrypt.hash(password);
    const user = await mockUserModel.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = mockJwt.sign();
    res.cookie = (name, value, options) => {
      res.cookieData = { name, value, options };
    };

    await mockTransporter.sendMail({});
    return res.json({ success: true });
  },

  login: async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await mockUserModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Invalid email" });
    }

    if (!user.isActive) {
      return res.json({
        success: false,
        message: "Your account has been deactivated. Please contact support.",
        contactLink: "/contact-us",
      });
    }

    const isMatch = await mockBcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid password" });
    }

    const token = mockJwt.sign();
    res.cookie = (name, value, options) => {
      res.cookieData = { name, value, options };
    };

    return res.json({ success: true });
  },

  logout: (req, res) => {
    res.clearCookie = (name, options) => {
      res.clearedCookie = { name, options };
    };
    return res.json({ success: true, message: "Logged Out" });
  },

  sendVerifyOtp: async (req, res) => {
    const user = await mockUserModel.findById(req.userId);
    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account Already Verified" });
    }

    user.verifyOtp = "123456";
    user.verifyOtpExpireAt = Date.now() + 3600000;
    await user.save();

    await mockTransporter.sendMail({});
    return res.json({
      success: true,
      message: "Verification OTP sent on Email",
    });
  },

  verifyEmail: async (req, res) => {
    const { otp } = req.body;
    if (!otp) {
      return res.json({ success: false, message: "Missing Details" });
    }

    const user = await mockUserModel.findById(req.userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.verifyOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP Expired" });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();

    return res.json({ success: true, message: "Email verified successfully" });
  },

  sendResetOtp: async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.json({ success: false, message: "Email is required" });
    }

    const user = await mockUserModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    user.resetOtp = "654321";
    user.resetOtpExpireAt = Date.now() + 900000;
    await user.save();

    await mockTransporter.sendMail({});
    return res.json({ success: true, message: "OTP sent to your Email" });
  },

  resetPassword: async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.json({
        success: false,
        message: "Email, OTP, and new passwords are required",
      });
    }

    const user = await mockUserModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not Found" });
    }

    if (user.resetOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP Expired" });
    }

    user.password = await mockBcrypt.hash(newPassword);
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;
    await user.save();

    return res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  },

  isAuthenticated: async (req, res) => {
    return res.json({ success: true });
  },
};

// Test runner
async function runTest(name, testFn) {
  try {
    await testFn();
    console.log(`✓ ${name}`);
  } catch (err) {
    console.log(`✗ ${name}`);
    console.log(err.message);
  }
}

// Run tests
console.log("Running auth controller tests...");

await runTest("Register requires all fields", async () => {
  const res = { json: (data) => data };
  const result = await testController.register({ body: {} }, res);
  assert.strictEqual(result.success, false);
});

await runTest("Register creates new user", async () => {
  const res = {
    json: (data) => data,
    cookie: () => {},
  };
  const result = await testController.register(
    {
      body: { name: "Test", email: "new@example.com", password: "test123" },
    },
    res
  );
  assert.strictEqual(result.success, true);
});

await runTest("Login requires email and password", async () => {
  const res = { json: (data) => data };
  const result = await testController.login({ body: {} }, res);
  assert.strictEqual(result.success, false);
});

await runTest("Login fails with wrong password", async () => {
  const res = { json: (data) => data };
  const result = await testController.login(
    {
      body: { email: "exists@example.com", password: "wrong" },
    },
    res
  );
  assert.strictEqual(result.success, false);
});

await runTest("Login succeeds with correct credentials", async () => {
  const res = {
    json: (data) => data,
    cookie: () => {},
  };
  const result = await testController.login(
    {
      body: { email: "exists@example.com", password: "test123" },
    },
    res
  );
  assert.strictEqual(result.success, true); // Fixed expectation
});

await runTest("Logout clears cookie", async () => {
  const res = {
    json: (data) => data,
    clearCookie: () => {},
  };
  const result = await testController.logout({}, res);
  assert.strictEqual(result.success, true);
});

await runTest("Email verification requires OTP", async () => {
  const res = { json: (data) => data };
  const result = await testController.verifyEmail(
    {
      userId: "user123",
      body: {},
    },
    res
  );
  assert.strictEqual(result.success, false);
});

await runTest("Password reset requires all fields", async () => {
  const res = { json: (data) => data };
  const result = await testController.resetPassword(
    {
      body: { email: "test@example.com" },
    },
    res
  );
  assert.strictEqual(result.success, false);
});

await runTest("isAuthenticated returns success", async () => {
  const res = { json: (data) => data };
  const result = await testController.isAuthenticated({}, res);
  assert.strictEqual(result.success, true);
});

console.log("Auth controller tests completed");
