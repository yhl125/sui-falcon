import React, { useRef, useEffect, useCallback, useState } from 'react';
import WalletUI from './WalletUI';
import '../styles/BeachAnimation.css';

interface ButtonsProps {
  visible: boolean;
  opacity: number;
  onCreateWallet: () => void;
  onLogin: () => void;
}

const ActionButtons: React.FC<ButtonsProps> = ({ visible, opacity, onCreateWallet, onLogin }) => {
  if (!visible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        opacity,
        transition: 'opacity 0.6s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        alignItems: 'center'
      }}
    >
      <button
        onClick={onCreateWallet}
        style={{
          background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
          color: 'white',
          border: 'none',
          padding: '1rem 2rem',
          borderRadius: '12px',
          fontSize: '1.2rem',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(74, 144, 226, 0.4)',
          transition: 'all 0.2s ease',
          minWidth: '200px'
        }}
      >
        Create Wallet
      </button>
      <button
        onClick={onLogin}
        style={{
          background: 'transparent',
          color: '#4A90E2',
          border: '2px solid #4A90E2',
          padding: '1rem 2rem',
          borderRadius: '12px',
          fontSize: '1.2rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          minWidth: '200px'
        }}
      >
        Login
      </button>
    </div>
  );
};

export const BeachAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);
  const [showWalletUI, setShowWalletUI] = useState(false);

  // Animation state - single run, no loop
  const stateRef = useRef({
    phase: 'text' as 'text' | 'wave' | 'flash' | 'buttons' | 'complete',
    waveProgress: 0,
    textOpacity: 1,
    flashOpacity: 0,
    buttonsOpacity: 0,
    shimmerOffset: 0,
    phaseTimer: 0,
    animationComplete: false
  });

  // Get current state safely
  const getCurrentState = () => stateRef.current;

  // Pixel art rendering system
  const drawPixel = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, color: string, size = 1) => {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), size, size);
  }, []);

  // Beach scene colors based on reference image
  const colors = {
    // Sand gradient from light to dark
    sand: ['#E8D4B0', '#D4C294', '#C2B280', '#B8A574', '#A89866'],
    // Ocean/water colors - multiple blues from reference
    deepWater: ['#2E7BB5', '#3681B8', '#4A90E2', '#5B9CE8'],
    shallowWater: ['#87CEEB', '#98D8F0', '#A8E0F5', '#B8E8FA'],
    // Foam and wave whites
    foam: ['#FFFFFF', '#F8FFFF', '#F0F8FF', '#E8F6FF'],
    // Sky gradient (top of scene)
    sky: ['#87CEEB', '#A0D8EF', '#B8E2F2', '#D0ECF5'],
    // Text color for sand writing
    text: '#8B7355'
  };

  const drawBeachScene = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw sky gradient (top 20%)
    const skyHeight = height * 0.2;
    for (let y = 0; y < skyHeight; y += 3) {
      for (let x = 0; x < width; x += 3) {
        const gradientFactor = y / skyHeight;
        const colorIndex = Math.floor(gradientFactor * colors.sky.length) % colors.sky.length;
        drawPixel(ctx, x, y, colors.sky[colorIndex], 3);
      }
    }

    // Draw deep water (20% - 45% from top)
    const deepWaterStart = skyHeight;
    const deepWaterEnd = height * 0.45;
    for (let y = deepWaterStart; y < deepWaterEnd; y += 2) {
      for (let x = 0; x < width; x += 2) {
        const waveNoise = Math.sin((x + stateRef.current.shimmerOffset) * 0.015 + y * 0.008 + Date.now() * 0.0008) * 0.5;
        const depthFactor = (y - deepWaterStart) / (deepWaterEnd - deepWaterStart);
        const baseIndex = Math.floor(depthFactor * colors.deepWater.length) % colors.deepWater.length;
        const colorIndex = Math.max(0, Math.min(colors.deepWater.length - 1, baseIndex + Math.floor(waveNoise * 2)));
        drawPixel(ctx, x, y, colors.deepWater[colorIndex], 2);
      }
    }

    // Draw shallow water (45% - 70% from top)
    const shallowStart = deepWaterEnd;
    const shallowEnd = height * 0.7;
    for (let y = shallowStart; y < shallowEnd; y += 2) {
      for (let x = 0; x < width; x += 2) {
        const waveNoise = Math.sin((x + stateRef.current.shimmerOffset) * 0.02 + y * 0.01 + Date.now() * 0.001) * 0.4;
        const shallowFactor = (y - shallowStart) / (shallowEnd - shallowStart);
        const baseIndex = Math.floor(shallowFactor * colors.shallowWater.length) % colors.shallowWater.length;
        const colorIndex = Math.max(0, Math.min(colors.shallowWater.length - 1, baseIndex + Math.floor(waveNoise * 2)));
        drawPixel(ctx, x, y, colors.shallowWater[colorIndex], 2);
      }
    }

    // Draw sand (bottom 30%)
    const sandStart = shallowEnd;
    for (let y = sandStart; y < height; y += 2) {
      for (let x = 0; x < width; x += 2) {
        const noise = Math.sin(x * 0.008 + y * 0.006) * 0.3 + Math.cos(x * 0.012) * 0.2;
        const sandDepth = (y - sandStart) / (height - sandStart);
        const baseIndex = Math.floor(sandDepth * colors.sand.length) % colors.sand.length;
        const colorIndex = Math.max(0, Math.min(colors.sand.length - 1, baseIndex + Math.floor(noise * 2)));
        drawPixel(ctx, x, y, colors.sand[colorIndex], 2);
      }
    }
  }, [drawPixel, colors]);

  const drawSandText = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (stateRef.current.textOpacity <= 0) return;

    ctx.save();
    ctx.globalAlpha = stateRef.current.textOpacity;

    // Calculate text position (centered in sand area - bottom 30%)
    const sandY = height * 0.7;
    const textY = sandY + (height * 0.15); // Middle of sand area

    // Draw "SuiQ" text as if carved into sand
    ctx.fillStyle = colors.text;
    ctx.font = `bold ${Math.min(width * 0.12, 100)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Create depth effect by drawing darker shadow first
    for (let dx = -3; dx <= 3; dx += 1) {
      for (let dy = -3; dy <= 3; dy += 1) {
        if (dx === 0 && dy === 0) continue;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= 3) {
          ctx.globalAlpha = stateRef.current.textOpacity * (0.3 / distance);
          ctx.fillStyle = '#6B5B47'; // Darker sand shadow
          ctx.fillText('SuiQ', width / 2 + dx, textY + dy);
        }
      }
    }

    // Draw main text
    ctx.globalAlpha = stateRef.current.textOpacity;
    ctx.fillStyle = colors.text;
    ctx.fillText('SuiQ', width / 2, textY);

    ctx.restore();
  }, [colors.text]);

  const drawWaveAnimation = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (stateRef.current.phase !== 'wave') return;

    const waveHeight = height * 0.3 * stateRef.current.waveProgress; // Wave covers sand area
    const sandStart = height * 0.7;

    // Draw advancing wave with foam washing over sand
    for (let y = sandStart; y < sandStart + waveHeight; y += 2) {
      for (let x = 0; x < width; x += 3) {
        const waveDistance = y - sandStart;
        const waveIntensity = waveDistance / waveHeight;

        // Create foam pattern at wave front
        const foamNoise = Math.sin(x * 0.08 + y * 0.05 + Date.now() * 0.004) * 0.8;
        const foamThreshold = 0.6 - (waveIntensity * 0.4);

        if (foamNoise > foamThreshold && waveIntensity > 0.8) {
          // White foam at wave edge
          ctx.globalAlpha = 0.9 - (waveIntensity * 0.3);
          drawPixel(ctx, x, y, colors.foam[Math.floor(Math.random() * colors.foam.length)], 3);
          ctx.globalAlpha = 1;
        } else if (waveIntensity > 0.2) {
          // Transparent water washing over sand
          ctx.globalAlpha = 0.6 + (waveIntensity * 0.2);
          const waterColorIndex = Math.floor(waveIntensity * colors.shallowWater.length) % colors.shallowWater.length;
          drawPixel(ctx, x, y, colors.shallowWater[waterColorIndex], 2);
          ctx.globalAlpha = 1;
        }
      }
    }
  }, [drawPixel, colors]);

  const drawShimmerEffect = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Create shimmering highlights across water areas
    const skyHeight = height * 0.2;
    const waterEndHeight = height * 0.7;

    // Shimmer in deep water
    for (let i = 0; i < 15; i++) {
      const x = (stateRef.current.shimmerOffset + i * 120) % (width + 200) - 100;
      const y = skyHeight + Math.sin(x * 0.008 + i) * (waterEndHeight - skyHeight) * 0.4 + (waterEndHeight - skyHeight) * 0.3;
      const size = Math.sin(Date.now() * 0.002 + i) * 2 + 3;

      ctx.save();
      ctx.globalAlpha = Math.sin(Date.now() * 0.003 + i * 0.7) * 0.4 + 0.3;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Additional shimmer in shallow water
    for (let i = 0; i < 10; i++) {
      const x = (stateRef.current.shimmerOffset * 0.7 + i * 180) % (width + 150) - 75;
      const y = height * 0.45 + Math.sin(x * 0.012 + i * 1.5) * height * 0.15 + height * 0.1;
      const size = Math.sin(Date.now() * 0.0025 + i * 0.8) * 1.5 + 2;

      ctx.save();
      ctx.globalAlpha = Math.sin(Date.now() * 0.004 + i * 0.6) * 0.3 + 0.25;
      ctx.fillStyle = '#F0FFFF';
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }, []);

  // White flash effect
  const drawFlashEffect = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (stateRef.current.flashOpacity <= 0) return;

    ctx.save();
    ctx.globalAlpha = stateRef.current.flashOpacity;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }, []);

  const handleCreateWallet = () => {
    setShowWalletUI(true);
  };

  const handleLogin = () => {
    setShowWalletUI(true);
  };

  const animate = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = stateRef.current;
    if (state.animationComplete) return; // Stop animation when complete

    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    state.shimmerOffset += deltaTime * 0.1;
    state.phaseTimer += deltaTime;

    // Single-run animation phases
    switch (state.phase) {
      case 'text':
        if (state.phaseTimer > 3000) { // Show text for 3 seconds
          state.phase = 'wave';
          state.phaseTimer = 0;
        }
        break;

      case 'wave':
        state.waveProgress = Math.min(state.phaseTimer / 2000, 1); // Wave animation over 2 seconds
        state.textOpacity = Math.max(1 - state.waveProgress * 1.5, 0); // Fade text as wave washes over

        if (state.phaseTimer > 2000) {
          state.phase = 'flash';
          state.phaseTimer = 0;
        }
        break;

      case 'flash':
        // Quick flash effect
        if (state.phaseTimer < 150) {
          state.flashOpacity = Math.sin((state.phaseTimer / 150) * Math.PI) * 0.8; // Flash in and out
        } else {
          state.flashOpacity = 0;
          state.phase = 'buttons';
          state.phaseTimer = 0;
        }
        break;

      case 'buttons':
        state.buttonsOpacity = Math.min(state.phaseTimer / 1000, 1); // Fade in buttons over 1 second

        if (state.phaseTimer > 1000) {
          state.phase = 'complete';
          state.animationComplete = true;
        }
        break;

      case 'complete':
        // Animation finished - stop the loop
        return;
    }

    // Draw scene
    drawBeachScene(ctx, canvas.width, canvas.height);
    drawSandText(ctx, canvas.width, canvas.height);
    drawWaveAnimation(ctx, canvas.width, canvas.height);
    drawShimmerEffect(ctx, canvas.width, canvas.height);
    drawFlashEffect(ctx, canvas.width, canvas.height);

    // Continue animation if not complete
    if (!state.animationComplete) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  }, [drawBeachScene, drawSandText, drawWaveAnimation, drawShimmerEffect, drawFlashEffect]);

  // Canvas setup and resize handling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Enable crisp pixel art rendering
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = false;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Start animation
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animate]);

  if (showWalletUI) {
    return <WalletUI visible={true} opacity={1} />;
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          imageRendering: 'pixelated'
        }}
      />
      <ActionButtons
        visible={getCurrentState().phase === 'buttons' || getCurrentState().phase === 'complete'}
        opacity={getCurrentState().buttonsOpacity}
        onCreateWallet={handleCreateWallet}
        onLogin={handleLogin}
      />
    </div>
  );
};

export default BeachAnimation;