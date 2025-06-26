import React, { useState } from 'react';
import './CreatePost.css';

export default function ImageGenerator({ defaultPrompt }) {
  const [prompt, setPrompt] = useState(defaultPrompt || '');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setIsLoading(true);
    setError('');
    setImageUrl('');
    try {
      const response = await fetch('http://localhost:4000/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setImageUrl(data.imageUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Drag event: set image url as dataTransfer
  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/uri-list', imageUrl);
    e.dataTransfer.setData('image/png', imageUrl);
  };

  return (
    <div className="image-generator">
      <label htmlFor="image-prompt">Generate Image from Prompt</label>
      <input
        id="image-prompt"
        type="text"
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="Enter prompt for image generation"
        className="image-prompt-input"
      />
      <button type="button" onClick={handleGenerate} disabled={isLoading || !prompt} className="transcribe-button">
        {isLoading ? 'Generating...' : 'Generate Image'}
      </button>
      {error && <div className="error-message">{error}</div>}
      {imageUrl && (
        <div className="generated-image-container">
          <img
            src={imageUrl}
            alt="Generated"
            draggable
            onDragStart={handleDragStart}
            className="generated-image"
            style={{ maxWidth: '100%', marginTop: 12, borderRadius: 8, cursor: 'grab' }}
          />
          <div className="help-text">Drag this image to the cover image field to use it as your post cover.</div>
        </div>
      )}
    </div>
  );
} 