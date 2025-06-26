const express = require('express');
const router = express.Router();
const { summarizeText } = require('../controllers/summarizeController');

router.post('/', summarizeText);
 
module.exports = router; 