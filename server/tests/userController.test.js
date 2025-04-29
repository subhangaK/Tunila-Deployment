import assert from "assert";

// Mock data and dependencies
const mockUser = {
  _id: "user123",
  name: "Test User",
  email: "test@example.com",
  role: "user",
  isAccountVerified: true,
  coverImage: "/uploads/covers/custom.png",
  profilePicture: "/uploads/profile_pictures/custom.png",
  canSellMerch: false,
  wishlist: ["song456"],
  songs: [],
  merchItems: [],
  save: async function () {
    return this;
  },
};

const mockSong = {
  _id: "song456",
  title: "Test Song",
  artistId: "user123",
};

const mockPlaylist = {
  _id: "playlist789",
  owner: "user123",
  isPublic: true,
  songs: [mockSong],
};

const mockUserModel = {
  findById: async (id) => {
    if (id === "user123") return mockUser;
    if (id === "unknown") return null;
    return null;
  },
  find: async (query, projection) => {
    if (projection === "-password") return [mockUser];
    return [];
  },
  findByIdAndDelete: async (id) => {
    if (id === "user123") return mockUser;
    return null;
  },
};

const mockSongModel = {
  find: async ({ artistId }) => {
    if (artistId === "user123") return [mockSong];
    return [];
  },
};

const mockPlaylistModel = {
  find: async ({ owner, isPublic }) => {
    if (owner === "user123" && isPublic) return [mockPlaylist];
    return [];
  },
  populate: async (playlists) => playlists,
};

// Mock file uploads
const mockFiles = {
  coverImage: [{ filename: "newcover.png" }],
  profilePicture: [{ filename: "newprofile.png" }],
};

// Create test controller with mocks
const testController = {
  getUserData: async (req, res) => {
    try {
      const user = await mockUserModel.findById(req.userId);

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      return res.status(200).json({
        success: true,
        userData: {
          userId: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isAccountVerified: user.isAccountVerified,
          coverImage: user.coverImage || "/uploads/covers/default.png",
          profilePicture:
            user.profilePicture || "/uploads/profile_pictures/default.png",
          canSellMerch: user.canSellMerch,
          wishlist: user.wishlist,
        },
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Server error" });
    }
  },

  getUserProfile: async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await mockUserModel.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      const songs = await mockSongModel.find({ artistId: userId });
      const playlists = await mockPlaylistModel.find({
        owner: userId,
        isPublic: true,
      });

      return res.status(200).json({
        success: true,
        userProfile: {
          userId: user._id,
          name: user.name,
          isAccountVerified: user.isAccountVerified,
          coverImage: user.coverImage || "/uploads/covers/default.png",
          profilePicture:
            user.profilePicture || "/uploads/profile_pictures/default.png",
          songs,
          playlists,
        },
      });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Error fetching profile" });
    }
  },

  updateUserProfile: async (req, res) => {
    try {
      const userId = req.userId;
      const user = await mockUserModel.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      if (req.files && req.files.coverImage) {
        user.coverImage = `/uploads/covers/users/${req.files.coverImage[0].filename}`;
      }

      if (req.files && req.files.profilePicture) {
        user.profilePicture = `/uploads/profile_pictures/${req.files.profilePicture[0].filename}`;
      }

      await user.save();

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        userProfile: {
          userId: user._id,
          name: user.name,
          coverImage: user.coverImage || "/uploads/covers/default.png",
          profilePicture:
            user.profilePicture || "/uploads/profile_pictures/default.png",
        },
      });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Error updating profile" });
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const users = await mockUserModel.find({}, "-password");
      return res.status(200).json({ success: true, users });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Error fetching users" });
    }
  },

  deleteUser: async (req, res) => {
    const { id } = req.params;

    try {
      const user = await mockUserModel.findByIdAndDelete(id);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      return res
        .status(200)
        .json({ success: true, message: "User deleted successfully." });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Error deleting user" });
    }
  },

  verifySeller: async (req, res) => {
    try {
      const user = await mockUserModel.findById(req.user._id);
      user.songs = req.user.songs || [];
      user.merchItems = req.user.merchItems || [];

      const isVerified = user.isAccountVerified && user.songs.length > 0;

      if (isVerified && !user.canSellMerch) {
        user.canSellMerch = true;
        await user.save();
      }

      return res.json({
        canSellMerch: user.canSellMerch,
        requirementsMet: isVerified,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
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
console.log("Running user controller tests...");

await runTest("getUserData returns user data for valid user", async () => {
  let responseData;
  const res = {
    status: (code) => {
      return {
        json: (data) => {
          responseData = { status: code, ...data };
        },
      };
    },
  };
  await testController.getUserData({ userId: "user123" }, res);
  assert.strictEqual(responseData.status, 200);
  assert.strictEqual(responseData.success, true);
  assert.strictEqual(responseData.userData.userId, "user123");
});

await runTest("getUserData fails for unknown user", async () => {
  let responseData;
  const res = {
    status: (code) => {
      return {
        json: (data) => {
          responseData = { status: code, ...data };
        },
      };
    },
  };
  await testController.getUserData({ userId: "unknown" }, res);
  assert.strictEqual(responseData.status, 404);
  assert.strictEqual(responseData.success, false);
});

await runTest("getUserProfile returns profile data", async () => {
  let responseData;
  const res = {
    status: (code) => {
      return {
        json: (data) => {
          responseData = { status: code, ...data };
        },
      };
    },
  };
  await testController.getUserProfile({ params: { userId: "user123" } }, res);
  assert.strictEqual(responseData.status, 200);
  assert.strictEqual(responseData.success, true);
  assert.strictEqual(responseData.userProfile.userId, "user123");
  assert.strictEqual(responseData.userProfile.songs.length, 1);
  assert.strictEqual(responseData.userProfile.playlists.length, 1);
});

await runTest("getUserProfile fails for unknown user", async () => {
  let responseData;
  const res = {
    status: (code) => {
      return {
        json: (data) => {
          responseData = { status: code, ...data };
        },
      };
    },
  };
  await testController.getUserProfile({ params: { userId: "unknown" } }, res);
  assert.strictEqual(responseData.status, 404);
  assert.strictEqual(responseData.error, "User not found");
});

await runTest("updateUserProfile updates images", async () => {
  let responseData;
  const res = {
    status: (code) => {
      return {
        json: (data) => {
          responseData = { status: code, ...data };
        },
      };
    },
  };
  await testController.updateUserProfile(
    { userId: "user123", files: mockFiles },
    res
  );
  assert.strictEqual(responseData.status, 200);
  assert.strictEqual(responseData.success, true);
  assert.strictEqual(
    responseData.userProfile.coverImage,
    "/uploads/covers/users/newcover.png"
  );
  assert.strictEqual(
    responseData.userProfile.profilePicture,
    "/uploads/profile_pictures/newprofile.png"
  );
});

await runTest("updateUserProfile fails for unknown user", async () => {
  let responseData;
  const res = {
    status: (code) => {
      return {
        json: (data) => {
          responseData = { status: code, ...data };
        },
      };
    },
  };
  await testController.updateUserProfile(
    { userId: "unknown", files: mockFiles },
    res
  );
  assert.strictEqual(responseData.status, 404);
  assert.strictEqual(responseData.success, false);
});

await runTest("getAllUsers returns users", async () => {
  let responseData;
  const res = {
    status: (code) => {
      return {
        json: (data) => {
          responseData = { status: code, ...data };
        },
      };
    },
  };
  await testController.getAllUsers({}, res);
  assert.strictEqual(responseData.status, 200);
  assert.strictEqual(responseData.success, true);
  assert.strictEqual(responseData.users.length, 1);
});

await runTest("deleteUser deletes user", async () => {
  let responseData;
  const res = {
    status: (code) => {
      return {
        json: (data) => {
          responseData = { status: code, ...data };
        },
      };
    },
  };
  await testController.deleteUser({ params: { id: "user123" } }, res);
  assert.strictEqual(responseData.status, 200);
  assert.strictEqual(responseData.success, true);
});

await runTest("deleteUser fails for unknown user", async () => {
  let responseData;
  const res = {
    status: (code) => {
      return {
        json: (data) => {
          responseData = { status: code, ...data };
        },
      };
    },
  };
  await testController.deleteUser({ params: { id: "unknown" } }, res);
  assert.strictEqual(responseData.status, 404);
  assert.strictEqual(responseData.success, false);
});

await runTest("verifySeller grants merch permission", async () => {
  let responseData;
  const res = {
    status: (code) => {
      return {
        json: (data) => {
          responseData = { status: code, ...data };
        },
      };
    },
    json: (data) => {
      responseData = data;
    },
  };
  const modifiedMockUser = {
    ...mockUser,
    songs: [mockSong],
  };
  mockUserModel.findById = async () => modifiedMockUser;
  await testController.verifySeller(
    { user: { _id: "user123", songs: [mockSong] } },
    res
  );
  assert.strictEqual(responseData.canSellMerch, true);
  assert.strictEqual(responseData.requirementsMet, true);
});

await runTest(
  "verifySeller denies merch permission for unverified user",
  async () => {
    let responseData;
    const res = {
      status: (code) => {
        return {
          json: (data) => {
            responseData = { status: code, ...data };
          },
        };
      },
      json: (data) => {
        responseData = data;
      },
    };
    const modifiedMockUser = {
      ...mockUser,
      isAccountVerified: false,
      songs: [mockSong],
    };
    mockUserModel.findById = async () => modifiedMockUser;
    await testController.verifySeller(
      { user: { _id: "user123", songs: [mockSong] } },
      res
    );
    assert.strictEqual(responseData.canSellMerch, false);
    assert.strictEqual(responseData.requirementsMet, false);
  }
);

console.log("User controller tests completed");
