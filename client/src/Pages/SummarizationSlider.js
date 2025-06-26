import React from 'react';
import './CreatePost.css';

export default function SummarizationSlider({ maxLength, setMaxLength, min, max }) {
  return (
    <div className="form-group">
      <label htmlFor="summary-slider">Summary Length: <b>{maxLength}</b></label>
      <input
        id="summary-slider"
        type="range"
        min={min}
        max={max}
        value={maxLength}
        onChange={e => setMaxLength(Number(e.target.value))}
        className="summary-slider"
      />
    </div>
  );
} 