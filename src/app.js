"use strict";

require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const moviedex = require("./moviedex.json");

const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

app.use(function validateBearerToken(req, res, next){
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get("Authorization");
  if(!authToken || authToken.split(' ')[1] !== apiToken){
    return res.status(400).json({ error: "Unauthorized request"})
  }
  next();
})

app.get("/movie", (req, res) => {
  let results = moviedex
  const { genre, country, avg_vote } = req.query;
  if (genre) {
    results = results.filter(
      movie => movie.genre.toLowerCase() === genre.toLowerCase()
    );
  }
  if (country) {
    results = results.filter(
      movie => movie.country.toLowerCase() === country.toLowerCase()
    );
  }
  if (avg_vote) {
    results = results.filter(
      movie => Number(movie.avg_vote) >= Number(avg_vote)
    );
  }
  if(!results.length){
    results = {message: `Based on query no results were found.`}
  }
  res.json(results);
});

module.exports = app;
