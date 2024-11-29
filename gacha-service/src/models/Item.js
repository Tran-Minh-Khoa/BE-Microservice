const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
    img: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    ratio: { type: Number, required: true } // Tỷ lệ xuất hiện của item
});
const Item = mongoose.model("Item", ItemSchema);
module.exports = Item;
