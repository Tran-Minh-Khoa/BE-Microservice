const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GachaDataSchema = new Schema({
    items: [{ type: String }], // Mảng các item
    itemSets: [{ type: String }] // Mảng các item sets
});
const GachaData = mongoose.model("GachaData", GachaDataSchema);
module.exports = GachaData;
