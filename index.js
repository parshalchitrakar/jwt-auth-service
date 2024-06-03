import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";
import fs from "fs";

// Set up Global configuration access
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());

// Simple in-memory user storage (for example purposes, normally you'd use a database)
let users = [];

// Load users from a JSON file
const loadUsers = () => {
  try {
    const dataBuffer = fs.readFileSync("users.json");
    const dataJSON = dataBuffer.toString();
    users = JSON.parse(dataJSON);
  } catch (e) {
    users = [];
  }
};

// Save users to a JSON file
const saveUsers = () => {
  const dataJSON = JSON.stringify(users);
  fs.writeFileSync("users.json", dataJSON);
};

app.get("/", (req, res) => {
  res.send("welcome to the auth service");
});

// Register endpoint
app.post("/auth/register", async (req, res) => {
  const { username, password } = req.body;

  // Check if user already exists
  const existingUser = users.find((user) => user.username === username);
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 8);

  // Create user
  const user = { username, password: hashedPassword };
  users.push(user);

  // Save users
  saveUsers();

  res.status(201).json({ message: "User registered successfully" });
});

// Login endpoint
app.post("/auth/login", async (req, res) => {
  const { username, password } = req.body;

  // Check if username or password is missing
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  // Find the user by username
  const user = users.find((user) => user.username === username);
  if (!user) {
    return res.status(400).json({ message: "Invalid username or password" });
  }

  // Compare the provided password with the stored hashed password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid username or password" });
  }

  res.status(200).json({ message: "Login successful" });
});
// Load users on server start
loadUsers();

app.listen(PORT, () => {
  console.log(`started server on port: ${PORT}`);
});
