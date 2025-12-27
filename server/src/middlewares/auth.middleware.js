import jwt from "jsonwebtoken";

export const verifyAdmin = (req, res, next) => {
  const token =
    req.headers.cookie?.split("=")[1] ||
    req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Unauthorized Token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    if (decoded.role !== "admin")
      return res.status(403).json({ message: "Forbidden" });

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid Token" });
  }
};
