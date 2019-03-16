const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");

const axios = require("axios");
const cheerio = require("cheerio");

// Require our models
const db = require("./models");

// Set port to use
const PORT = 3000;

// Initialize Express
const app = express();

// Configure middleware below

// Morgan logger for logging requests
app.use(logger("dev"));

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Make a public static folder
app.use(express.static("public"));

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);



// Routes

// A GET route for scraping my chosen website
app.get("/scrape", function (req, res) {
    // First, grab the body of the html with axios
    axios.get("https://www.newyorker.com/latest/books").then(function (response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        let $ = cheerio.load(response.data);

        // Now grab the title by its corresponding tag, and run the following:
        $(".River__riverItemContent___2hXMG").each(function (i, element) {
            // Save an empty result object
            let result = {};

            // Add the text and href of every link, and save them as properties of the result object
            
            // console.log($(element).html());

            result.title = $(element)
                .find("h4")
                .text();
            result.summary = $(element)
                .find("h5")
                .text();
            result.author = $(element)
                .find("p.Byline__by___37lv8")
                .text();
            // result.link = $(element)
            //     .find("a").attr("href")
            //     .link();

                console.log(result);

            // Create a new Article using the 'result object built from scraping
            // db.Article.create(result)
            //     .then(function (dbArticle) {
            //         console.log(err);
            //     });
        });

        // Send a message to the client
        res.send("Scrape Complete");
    });
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
        .then(function (dbArticle) {
            // If we were able to successfully find Articles, send them back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurs, send it to the client
            res.json(err);
        });
});

// Route for grabbing a specific Article by id, populate it with its note
app.get("/articles/:id", function (req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
        // ..and populate all of the notes associated with it
        .populate("note")
        .then(function (dbArticle) {
            // If we were able to succesfully find an Article with the given id, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occured, send it to the client
            res.json(err);
        });
});

// Route for saving/updating an Article's associated note
app.post("/articles/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
        .then(function (dbNote) {
            // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function (dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurs, send it to the client
            res.json(err);
        });
});


// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});