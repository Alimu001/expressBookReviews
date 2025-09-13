const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
let users = require("./users.js");  
const regd_users = express.Router();

// Utility: check if user exists
const isValid = (username) => {
    return users.some((user) => user.username === username);
};

// Utility: authenticate user
const authenticatedUser = (username, password) => {
    return users.find((user) => user.username === username && user.password === password);
};

// ---------------- LOGIN ----------------
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid credentials"});
  }
  
  // Create JWT
  let accessToken = jwt.sign({ username }, "access", { expiresIn: "1h" });

  // Store in session
  req.session.authorization = { accessToken, username };

  return res.status(200).json({ message: "Login successful", token: accessToken });
});

// ---------------- ADD or MODIFY REVIEW ----------------
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;

  if (!review) {
    return res.status(400).json({ message: "Review text is required" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  const username = req.session.authorization.username;

  if (!username) {
    return res.status(403).json({ message: "User not logged in" });
  }

  // Add or update review
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }
  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: "Review added/updated successfully", reviews: books[isbn].reviews });
});

// ---------------- DELETE REVIEW ----------------
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  const username = req.session.authorization.username;

  if (!username) {
    return res.status(403).json({ message: "User not logged in" });
  }

  if (books[isbn].reviews && books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).json({ message: "Review deleted successfully", reviews: books[isbn].reviews });
  } else {
    return res.status(404).json({ message: "No review found for this user" });
  }
});

module.exports.authenticated = regd_users;
