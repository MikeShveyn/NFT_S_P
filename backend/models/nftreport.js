const mongoose = require('mongoose');

// Define a schema for the feedback object
const nftReportSchema = new mongoose.Schema({
    chain: { type: String },
    contract_address: { type: String },
    token_id: { type: String },
    metadata_url: { type: String },
    metadata: {
        image:  { type: String },
        name:  { type: String },
        description: { type: String },
    },
    file_information: {
        height: { type: Number },
        width: { type: Number },
        file_size: { type: Number }, 
    },  
    file_url: { type: String },
    mint_date: { type: Date },
    updated_date:  { type: Date },
    owner: { type: String }
});

// Create a Mongoose model based on the feedback schema
module.exports = mongoose.model('NftReport', nftReportSchema);
