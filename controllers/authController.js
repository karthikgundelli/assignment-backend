import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// Signup logic
export const signup = async (req, res) => {
  console.log("Received signup data:", req.body); // See incoming data
  const { username, email, password } = req.body;
  try {
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed });
    const token = generateToken(user);
    res.status(201).json({ user: { id: user._id, username, email }, token });
  } catch (err) {
    console.error("SIGNUP ERROR:", err);    // Log actual error
    res.status(500).json({ message: "Server error" });
  }
};

// Login logic
export const login = async (req, res) => {
  console.log("LOGIN: Received body:", req.body);
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    console.log("User found in DB:", user);
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match?", isMatch);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = generateToken(user);
    res.json({ user: { id: user._id, username: user.username, email: user.email }, token });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get profile (dashboard/profile view)
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile" });
  }
};

// Update profile (dashboard edit/save)
export const updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { username, email },
      { new: true, runValidators: true }
    ).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error updating profile" });
  }
};
