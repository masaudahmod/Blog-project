import bcrypt from "bcrypt";
import { findUserByEmail, createUser } from "../models/user.model.js";
import { generateToken } from "../utils/jwt.js";

export const registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await findUserByEmail(email);
  if (userExists.rows.length > 0)
    return res.status(400).json({ message: "Email already exists" });

  const hash = await bcrypt.hash(password, 10);

  const newUser = await createUser(name, email, hash);
  res.json(newUser.rows[0]);
};

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  const user = await findUserByEmail(email);
  if (user.rows.length === 0)
    return res.status(400).json({ message: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.rows[0].password);
  if (!valid) return res.status(400).json({ message: "Invalid credentials" });

  const token = generateToken(user.rows[0]);

  res.json({ token });
};
