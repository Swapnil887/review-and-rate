const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const {
    createCompany,
    getCompanies,
    getCompanyById
} = require('../controller/company.controller');

const router = express.Router();

router.post('/', authMiddleware, createCompany);
router.get('/', getCompanies);
router.get('/:id', getCompanyById);

module.exports = router;
