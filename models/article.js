const mongoose = require("mongoose");

// Save a reference to the schema constructor
const Schema = mongoose.Schema;

// Using the Schema constructor, create a new UserSchema object
let ArticleSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    note: {
        type: Schema.Types.ObjectId,
        ref: "Note"
    }
});

// This creates our model from the above schema, using Mongoose's model method
let Article = mongoose.model("Article", ArticleSchema);

// Export the Article model
module.exports = Article;