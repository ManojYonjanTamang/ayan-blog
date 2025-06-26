const axios = require('axios');
const fs = require('fs');
const path = require('path');

const HF_IMAGE_API_KEY = process.env.HF_IMAGE_API_KEY || 'YOUR_IMAGE_HF_IMAGE_API_KEY';

exports.callHuggingFaceSDXL = async (prompt) => {
  try {
    const response = await axios({
      method: 'post',
      url: 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
      headers: {
        'Authorization': `Bearer ${HF_IMAGE_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'image/png',
      },
      data: JSON.stringify({ inputs: prompt }),
      responseType: 'arraybuffer', // Get image as binary
      timeout: 60000,
    });
    // Convert binary to base64 for frontend
    const base64Image = Buffer.from(response.data, 'binary').toString('base64');
    return `data:image/png;base64,${base64Image}`;
  } catch (err) {
    // Try to decode the error buffer as JSON
    if (err.response && err.response.data) {
      try {
        const errorJson = JSON.parse(Buffer.from(err.response.data).toString('utf8'));
        console.error('Hugging Face API error:', errorJson);
        throw new Error(errorJson.error || JSON.stringify(errorJson));
      } catch (parseErr) {
        // Fallback: print raw buffer
        console.error('Raw error buffer:', err.response.data);
        throw err;
      }
    }
    throw err;
  }
};