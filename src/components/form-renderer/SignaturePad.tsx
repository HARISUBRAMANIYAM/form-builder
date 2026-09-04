import React, { useRef, useEffect, useState, useCallback } from 'react';

interface SignaturePadProps {
  value?: string;                // base64 data URL
  onChange?: (dataUrl: string) => void;
  penColor?: string;
  penWidth?: number;
  showClear?: boolean;
  disabled?: boolean;
  hasError?: boolean;
}

const SignaturePad: React.FC<SignaturePadProps> = ({
  value,
  onChange,
  penColor = '#000000',
  penWidth = 2,
  showClear = true,
  disabled = false,
  hasError = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  // ── Helpers ────────────────────────────────────────────────
  const getPos = (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: ((e as MouseEvent).clientX - rect.left) * scaleX,
      y: ((e as MouseEvent).clientY - rect.top) * scaleY,
    };
  };

  // ── Draw logic ─────────────────────────────────────────────
  const startDraw = useCallback((e: MouseEvent | TouchEvent) => {
    if (disabled) return;
    e.preventDefault();
    isDrawing.current = true;
    const canvas = canvasRef.current!;
    lastPos.current = getPos(e, canvas);
  }, [disabled]);

  const draw = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDrawing.current || disabled) return;
    e.preventDefault();
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const pos = getPos(e, canvas);

    ctx.beginPath();
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(lastPos.current!.x, lastPos.current!.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    lastPos.current = pos;
    setIsEmpty(false);
  }, [disabled, penColor, penWidth]);

  const stopDraw = useCallback(() => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    lastPos.current = null;
    const canvas = canvasRef.current!;
    onChange?.(canvas.toDataURL('image/png'));
  }, [onChange]);

  // ── Event binding ──────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current!;
    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('mouseleave', stopDraw);
    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDraw);
    return () => {
      canvas.removeEventListener('mousedown', startDraw);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDraw);
      canvas.removeEventListener('mouseleave', stopDraw);
      canvas.removeEventListener('touchstart', startDraw);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDraw);
    };
  }, [startDraw, draw, stopDraw]);

  // ── Restore from value ─────────────────────────────────────
  useEffect(() => {
    if (value) {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      img.onload = () => { ctx.drawImage(img, 0, 0); setIsEmpty(false); };
      img.src = value;
    }
  }, []); // only on mount

  const clear = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onChange?.('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div
        style={{
          position: 'relative',
          border: `1.5px solid ${hasError ? 'var(--fb-danger)' : 'var(--fb-border)'}`,
          borderRadius: 10,
          overflow: 'hidden',
          background: '#ffffff',
          cursor: disabled ? 'not-allowed' : 'crosshair',
          boxShadow: hasError ? '0 0 0 3px var(--fb-danger-light)' : undefined,
        }}
      >
        <canvas
          ref={canvasRef}
          width={600}
          height={180}
          style={{ width: '100%', height: 180, display: 'block', touchAction: 'none' }}
        />
        {isEmpty && !disabled && (
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 6, color: 'var(--fb-text-muted)',
          }}>
            <i className="pi pi-pen-to-square" style={{ fontSize: 20 }} />
            <span style={{ fontSize: '0.8rem' }}>Sign here</span>
          </div>
        )}
      </div>
      {showClear && !disabled && !isEmpty && (
        <button
          type="button"
          onClick={clear}
          className="fb-action-btn fb-action-btn-secondary"
          style={{ alignSelf: 'flex-start', fontSize: '0.75rem', padding: '4px 10px' }}
        >
          <i className="pi pi-eraser" /> Clear
        </button>
      )}
    </div>
  );
};

export default SignaturePad;
