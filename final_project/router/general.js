const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let users = require("./users.js");
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  //check if both username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  //Check if user already exists
  let existingUser = users.find(user => user.username === username);
  if (existingUser) {
    return res.status(400).json({ message: "User already exist" });
  }

  //Add new user
  users.push({ username, password });
  return res.status(200).json({ message: "Usere registered successfully" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).json({
    message: "List of all books",
    books: books
  });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = Number(req.params.isbn);
  if(books[isbn]) {
    return res.status(200).json(books[isbn]);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
  
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author.toLowerCase();
  const results = Object.values(books).filter(
    (book) => book.author.toLowerCase() === author.toLowerCase()
  );
  if (results.length > 0) {
    return res.status(200).json(results);
  } else {
    return res.status(404).json({message: "No books found for this author"});
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title.toLowerCase();
  const results = Object.values(books).filter(
    (book) => book.title.toLowerCase() === title.toLowerCase()
  );
  if (results.length > 0) {
    return res.status(200).json(results);
  } else {
    return res.status(404).json({message: "No books found with this title"});
  }
});

// ---------------- PROMISE BASED ROUTES ----------------
public_users.get('/books-promise', (req, res) => {
  axios.get("http://localhost:5000/")
    .then(response => res.json(response.data))
    .catch(err => res.status(500).json({ message: "Error fetching books", error: err.message }));
});

public_users.get('/isbn-promise/:isbn', (req, res) => {
  axios.get(`http://localhost:5000/isbn/${req.params.isbn}`)
    .then(response => res.json(response.data))
    .catch(err => res.status(404).json({ message: "Book not found", error: err.message }));
});

public_users.get('/author-promise/:author', (req, res) => {
  axios.get(`http://localhost:5000/author/${req.params.author}`)
    .then(response => res.json(response.data))
    .catch(err => res.status(404).json({ message: "Books not found", error: err.message }));
});

public_users.get('/title-promise/:title', (req, res) => {
  axios.get(`http://localhost:5000/title/${req.params.title}`)
    .then(response => res.json(response.data))
    .catch(err => res.status(404).json({ message: "Books not found", error: err.message }));
});

// ---------------- ASYNC/AWAIT ROUTES ----------------
public_users.get('/books-async', async (req, res) => {
  try {
    const response = await axios.get("http://localhost:5000/");
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching books", error: err.message });
  }
});

public_users.get('/isbn-async/:isbn', async (req, res) => {
  try {
    const response = await axios.get(`http://localhost:5000/isbn/${req.params.isbn}`);
    res.json(response.data);
  } catch (err) {
    res.status(404).json({ message: "Book not found", error: err.message });
  }
});

public_users.get('/author-async/:author', async (req, res) => {
  try {
    const response = await axios.get(`http://localhost:5000/author/${req.params.author}`);
    res.json(response.data);
  } catch (err) {
    res.status(404).json({ message: "Books not found", error: err.message });
  }
});

public_users.get('/title-async/:title', async (req, res) => {
  try {
    const response = await axios.get(`http://localhost:5000/title/${req.params.title}`);
    res.json(response.data);
  } catch (err) {
    res.status(404).json({ message: "Books not found", error: err.message });
  }
});


//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({message: "book not found"});
  }
});

module.exports.general = public_users;
