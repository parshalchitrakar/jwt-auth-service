import express from "express";
import dotenv, { config } from "dotenv";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";
import fs from "fs";
import morgan from "morgan";
import uuid from "node-uuid";
// Set up Global configuration access
dotenv.config();

morgan.token("id", (req) => {
  return req.id;
});

const app = express();
const SERVER_PORT = process.env.SERVER_PORT || 6000;

// Middleware
app.use(bodyParser.json());
app.use(assignId);
app.use(morgan(":id :method :url :response-time"));
function assignId(req, res, next) {
  req.id = uuid.v4();
  next();
}

// Simple in-memory user storage (for example purposes, normally you'd use a database)
let users = [];
let refreshTokens = []; //not a best practice for production because everytime the server runs then it will be empty. just doing for now

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

  res.status(201).json({ id: req.id, message: "User registered successfully" });
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
  let loginUser = { user: user.username };
  const accessToken = generateAccessToken(loginUser);
  const refreshToken = jwt.sign(
    { user: user.username },
    process.env.REFRESH_TOKEN_SECRET_KEY
  );
  refreshTokens.push(refreshToken); //storing the refresh token. we can use redis or some cache server to store.

  res.status(200).json({
    id: req.id,
    accessToken: accessToken,
    refreshToken: refreshToken,
    message: "Login successful",
  });
});

app.post("/auth/token", async (req, res) => {
  const refreshToken = await req?.body?.token;
  console.log(refreshToken);
  if (refreshToken == null) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET_KEY,
    (err, user) => {
      // here user =  { user: 'parshall', iat: 1717641966 }
      if (err) return res.sendStatus(403);
      const accessToken = generateAccessToken({ user: user?.user });
      return res.send({ accessToken: accessToken });
    }
  );
});

app.delete("/auth/logout", async (req, res) => {
  refreshTokens = refreshTokens.filter((token) => token !== req?.body?.token);
  return res.status(404).json({ message: "Token not found" });
});

function generateAccessToken(user) {
  return jwt.sign(
    user, //we need an object or the username for the payload
    process.env.ACCESS_TOKEN_SECRET_KEY,
    {
      expiresIn: "15sec",
    }
  );
}

// Load users on server start
loadUsers();

app.listen(SERVER_PORT, () => {
  console.log(`started Auth server on port: ${SERVER_PORT}`);
});
