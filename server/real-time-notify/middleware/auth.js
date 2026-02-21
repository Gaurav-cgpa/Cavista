import jwt from "jsonwebtoken";
import User from "../schema/user.js";

export const protect = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    } else if (req.cookies && req.cookies["jwt-cookie"]) {
      token = req.cookies["jwt-cookie"];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
    console.error("Error in protect middleware:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};