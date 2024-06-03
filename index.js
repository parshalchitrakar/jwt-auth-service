import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

// Set up Global configuration access
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("welcome to the auth service");
});

app.listen(PORT, () => {
  console.log(`started server on port: ${PORT}`);
});
