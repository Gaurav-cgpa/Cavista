
import User from "../schema/user.js";

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const updateDetails = async (req, res) => {
  try {
    const allowedFields = [
      "fullName",
      "email",
      "age",
      "gender",
      "height",
      "weight",
      "dob",
      "bloodGroup",
      "phoneNumber"
    ];

    const updatedData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updatedData[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updatedData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ 
      success: true, 
      message: "Details updated successfully", 
      data: user 
    });

  } catch (error) {
    console.error("Error in updateDetails controller:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};