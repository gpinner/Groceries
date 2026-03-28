import { useEffect, useRef } from 'react';
import './VoiceModal.css';

const BAR_COUNT = 28;

export default function VoiceModal({ transcript, analyserNode, onCancel }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    // Always animate — even without analyser (idle bars)
    const dataArray = analyserNode
      ? new Uint8Array(analyserNode.frequencyBinCount)
      : null;

    let t = 0;

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, W, H);

      const barW = (W / BAR_COUNT) * 0.55;
      const gap  = (W / BAR_COUNT) * 0.45;

      for (let i = 0; i < BAR_COUNT; i++) {
        let value;

        if (dataArray && analyserNode) {
          analyserNode.getByteFrequencyData(dataArray);
          const step = Math.floor(dataArray.length / BAR_COUNT);
          value = dataArray[i * step] / 255;
        } else {
          // Idle ripple when no audio yet
          value = 0.08 + 0.06 * Math.sin(t * 2 + i * 0.4);
        }

        value = Math.max(value, 0.03);
        const barH = value * H * 0.88;
        const x    = i * (barW + gap) + gap / 2;
        const y    = (H - barH) / 2;
        const alpha = 0.45 + value * 0.55;

        ctx.fillStyle = `rgba(52, 211, 153, ${alpha})`;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, barW / 2);
        ctx.fill();
      }
      t += 0.04;
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [analyserNode]);

  return (
    <div className="voice-overlay">
      <div className="voice-modal">
        <div className="voice-header">
          <span className="voice-dot" />
          <span className="voice-label">Listening</span>
        </div>

        <canvas
          ref={canvasRef}
          className="waveform-canvas"
          width={300}
          height={80}
        />

        <p className="voice-transcript">
          {transcript
            ? <span className="transcript-text">{transcript}</span>
            : <span className="transcript-hint">Say a product name…</span>}
        </p>

        <button className="voice-cancel-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
