import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import fs from "fs";
import morgan from "morgan";
import uuid from "node-uuid";
// Set up Global configuration access
dotenv.config();

morgan.token("id", (req) => {
  return req.id;
});

const app = express();
const PORT = process.env.PORT || 5000;

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

//Handlers
app.get("/", (req, res) => {
  res.send("welcome to the auth service");
});

// Route to handle /posts request with token authentication
app.get("/posts", authenticateToken, (req, res) => {
  try {
    fs.readFile("./public/posts.json", "utf8", (err, data) => {
      if (err) {
        return res.status(500).send("Error reading file");
      }

      let posts;
      try {
        posts = JSON.parse(data);
      } catch (parseError) {
        return res.status(500).send("Error parsing JSON");
      }

      const filteredPosts = posts.filter(
        (post) => post.username === req.user.user
      );
      res.json(filteredPosts);
    });
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal Server Error");
  }
});

// Load users on server start
loadUsers();

//authenticate token or verify token before giving access to any routes
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"]; // Berear TOKEN
  const token = authHeader?.split(" ")[1]; // TOKEN
  if (token == null) {
    return res.sendStatus(401);
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next(); //Ensure next() is called only if no error occurred
  });
}

app.listen(PORT, () => {
  console.log(`started server on port: ${PORT}`);
});
