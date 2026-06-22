const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    foundedOn: {
        type: Date,
        required: true
    },
    logo: {
        type: String,
        trim: true,
        default: ''
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

companySchema.index({ name: 'text', description: 'text' });
companySchema.index({ city: 1, location: 1 });

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
