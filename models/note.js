const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Save a reference to the Schema constructor, create a new NoteSchema object
// This is similar to a Sequelize model

let NoteSchema = new Schema({
    title: String,
    body: String
});

// This creates our model from the above schema, using Monngoose's model method
let Note = mongoose.model("Note", NoteSchema);

// Export the Note model
module.exports = Note;