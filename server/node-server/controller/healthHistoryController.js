import User from "../schema/user.js";

export const updateHealthHistory = async (req, res) => {
  try {
    const { patientId, healthHistory } = req.body;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "patientId is required"
      });
    }

    if (!healthHistory) {
      return res.status(400).json({
        success: false,
        message: "healthHistory data is required"
      });
    }


    const updatedUser = await User.findByIdAndUpdate(
      patientId,
      { $set: { healthHistory } },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Health history updated successfully",
      data: updatedUser.healthHistory
    });

  } catch (error) {
    console.error("Error updating health history:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};