const Company = require('../models/company.model');

const createCompany = async (req, res) => {
    try {
        const { name, location, city, foundedOn, logo, description } = req.body;

        if (!name || !location || !city || !foundedOn) {
            return res.status(400).json({
                message: 'Company name, location, city, and foundedOn are required.'
            });
        }

        const foundedDate = new Date(foundedOn);
        if (Number.isNaN(foundedDate.getTime())) {
            return res.status(400).json({ message: 'Invalid foundedOn date.' });
        }

        const company = await Company.create({
            name,
            location,
            city,
            foundedOn: foundedDate,
            logo: logo || '',
            description: description || ''
        });

        res.status(201).json({
            message: 'Company profile created successfully.',
            company
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to create company.', error: err.message });
    }
};

const getCompanies = async (req, res) => {
    try {
        const { search, city, location } = req.query;
        const filter = {};

        if (search) {
            filter.$text = { $search: search };
        }

        if (city) {
            filter.city = new RegExp(city, 'i');
        }

        if (location) {
            filter.location = new RegExp(location, 'i');
        }

        const companies = await Company.find(filter).sort({ createdAt: -1 });

        res.status(200).json({
            message: 'Companies fetched successfully.',
            count: companies.length,
            companies
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch companies.', error: err.message });
    }
};

const getCompanyById = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({ message: 'Company not found.' });
        }

        res.status(200).json({
            message: 'Company fetched successfully.',
            company
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch company.', error: err.message });
    }
};

module.exports = {
    createCompany,
    getCompanies,
    getCompanyById
};
