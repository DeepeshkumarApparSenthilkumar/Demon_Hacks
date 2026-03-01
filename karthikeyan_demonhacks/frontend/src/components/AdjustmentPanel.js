import React from 'react';
import './AdjustmentPanel.css';

function AdjustmentPanel({ onAdjust, loading, currentStopIndex }) {
  return (
    <div className="adjustment-panel">
      <h3>✏️ Adjust Your Tour</h3>
      <p className="panel-subtitle">Feeling different? Update your tour in real time</p>

      <div className="adjustment-buttons">
        <button
          className="adjust-btn tired"
          onClick={() => onAdjust('TIRED')}
          disabled={loading}
          title="Shorten the remaining tour"
        >
          😴 I'm tired
        </button>

        <button
          className="adjust-btn food"
          onClick={() => onAdjust('MORE_INTEREST', 'food')}
          disabled={loading}
          title="Add more food-related stops"
        >
          🍕 More food
        </button>

        <button
          className="adjust-btn crowd"
          onClick={() => onAdjust('TOO_CROWDED')}
          disabled={loading}
          title="Avoid crowded places"
        >
          🤫 Too crowded
        </button>

        <button
          className="adjust-btn coffee"
          onClick={() => onAdjust('MORE_INTEREST', 'coffee')}
          disabled={loading}
          title="Add more coffee stops"
        >
          ☕ More coffee
        </button>
      </div>

      <div className="adjustment-info">
        <p>💡 Tip: Your tour will recalculate from your current stop</p>
      </div>
    </div>
  );
}

export default AdjustmentPanel;
