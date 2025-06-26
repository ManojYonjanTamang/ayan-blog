const { callHuggingFaceSDXL } = require('../utils/huggingfaceImage');

exports.generateImage = async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }
  try {
    const imageBase64 = await callHuggingFaceSDXL(prompt);
    res.json({ imageUrl: imageBase64 });
  } catch (err) {
    console.error('Image generation error:', err);
    res.status(500).json({ error: err.message });
  }
}; 