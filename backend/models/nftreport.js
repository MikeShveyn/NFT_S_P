const mongoose = require('mongoose');

// Define a schema for the feedback object
const nftReportSchema = new mongoose.Schema({
    chain: { type: String },
    contract_address: { type: String },
    token_id: { type: String },
    file_url: { type: String },
    file_size: { type: Number },
    mint_date: { type: Date },
    owner: { type: String }
});

// Create a Mongoose model based on the feedback schema
module.exports = mongoose.model('NftReport', nftReportSchema);
