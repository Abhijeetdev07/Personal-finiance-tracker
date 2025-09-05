const User = require("../models/User");

// Get user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId).select('-password -resetPasswordOtpHash -resetPasswordOtpExpiresAt -resetPasswordOtpRetryCount -resetPasswordState');
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      profile: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        bio: user.bio,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    let { firstName, lastName, phone, bio } = req.body;

    // Remove spaces from first name, last name, and phone
    if (firstName) firstName = firstName.replace(/\s/g, '');
    if (lastName) lastName = lastName.replace(/\s/g, '');
    if (phone) phone = phone.replace(/\s/g, '');

    // Validate input
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;

    // Validate first name (only letters, no spaces)
    if (firstName && firstName !== "" && !/^[a-zA-Z]+$/.test(firstName)) {
      return res.status(400).json({ error: "First name can only contain letters (no spaces, numbers, or symbols)" });
    }

    // Validate last name (only letters, no spaces)
    if (lastName && lastName !== "" && !/^[a-zA-Z]+$/.test(lastName)) {
      return res.status(400).json({ error: "Last name can only contain letters (no spaces, numbers, or symbols)" });
    }

    // Validate phone number format if provided (exactly 10 digits)
    if (phone && phone !== "" && !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ error: "Phone number must be exactly 10 digits starting with 6, 7, 8, or 9" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -resetPasswordOtpHash -resetPasswordOtpExpiresAt -resetPasswordOtpRetryCount -resetPasswordState');

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      profile: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        bio: user.bio,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error("Update profile error:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
