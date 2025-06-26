const express = require('express');
const router = express.Router();
const { generateImage } = require('../controllers/generateImageController');

router.post('/', generateImage);
 
module.exports = router; 