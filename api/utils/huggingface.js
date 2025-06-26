require('dotenv').config();

const express = require("express");
const axios = require('axios');

const API_URL = 'https://api-inference.huggingface.co/models/facebook/bart-large-cnn';
const HF_API_KEY = process.env.HF_API_KEY || 'YOUR_HF_API_KEY';

async function summarizeChunk(text, min_length, max_length) {
  const headers = {
    Authorization: `Bearer ${HF_API_KEY}`,
  };
  const payload = {
    inputs: text,
    parameters: {
      min_length,
      max_length,
    },
  };
  const response = await axios.post(API_URL, payload, { headers });
  if (Array.isArray(response.data) && response.data[0].summary_text) {
    return response.data[0].summary_text;
  } else if (response.data.summary_text) {
    return response.data.summary_text;
  } else {
    throw new Error('Failed to get summary from Hugging Face API');
  }
}

exports.callHuggingFaceSummarization = async (text, min_length, max_length) => {
  // Split text into chunks of ~3500 characters (safe for BART)
  const chunkSize = 3500;
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }

  // Summarize each chunk and join the results
  const summaries = [];
  for (const chunk of chunks) {
    const summary = await summarizeChunk(chunk, min_length, max_length);
    summaries.push(summary);
  }
  return summaries.join(' ');
};

const HF_IMAGE_API_KEY = process.env.HF_IMAGE_API_KEY || 'YOUR_IMAGE_HF_API_KEY';

exports.callHuggingFaceSDXL = async (prompt) => {
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${HF_IMAGE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer', // Get image as binary
      }
    );
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