// Require postgres
const { Pool } = require("pg");

const pool = new Pool({
  user: "your username",
  password: "12345",
  host: "localhost",
  port: 5432, // default Postgres port
  database: "flags",
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};

pool.connect();

// Require express app
const express = require("express");
const app = express();


// Middleware
// Require path
const path = require("path");
// set path to views
app.set("views", path.join(__dirname, "views"));
// Set the view engine for the ejs file
app.set("view engine", "ejs");

// Middleware
// for post request, we will need url encoded
app.use(express.urlencoded({ extended: true }));
// This is to use the public file
app.use(express.static("public"));

let quiz = [];
pool.query("SELECT * FROM country_flags", (err, res) => {
  if (err) {
    console.error("Error executing query", err.stack);
  } else {
    quiz = res.rows;
  }
  pool.end();
});


let totalCorrect = 0;

let currentQuestion = {};

// GET home page
app.get("/", (req, res) => {
  totalCorrect = 0;
  nextQuestion();
  console.log(currentQuestion);
  res.render("index.ejs", { question: currentQuestion });
});

// POST a new post
app.post("/submit", (req, res) => {
  let answer = req.body.answer.trim();
  let isCorrect = false;
  if (currentQuestion.name.toLowerCase() === answer.toLowerCase()) {
    totalCorrect++;
    console.log(totalCorrect);
    isCorrect = true;
  }

  nextQuestion();
  res.render("index.ejs", {
    question: currentQuestion,
    wasCorrect: isCorrect,
    totalScore: totalCorrect,
  });
});

function nextQuestion() {
  const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];
  currentQuestion = randomCountry;
}

app.listen(3000, () => {
  console.log("Server is running at 3000!");
});
