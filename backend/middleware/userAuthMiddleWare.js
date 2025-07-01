import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const userAuthMiddleWare = async (req, res, next) => {
  let token = req.headers["authorization"] || req.cookies.token;

  // Extract token from "Bearer <token>"
  if (req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Extract token from cookies
  if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(";");
    const tokenCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("token=")
    );
    if (tokenCookie) {
      token = tokenCookie.split("=")[1];
    }
  }

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ email: decoded.email }).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
