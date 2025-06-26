const { callHuggingFaceSummarization } = require('../utils/huggingface');

exports.summarizeText = async (req, res) => {
  const { text, max_length } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }
  try {
    const min_length = Math.floor((max_length || 100) / 4);
    const summary = await callHuggingFaceSummarization(text, min_length, max_length || 100);
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 