const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSetSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    items: [{ type: String }] // Mảng các item
});
const ItemSet = mongoose.model("ItemSet", ItemSetSchema);
module.exports = ItemSet;
