import React, { useRef, useEffect, useCallback } from 'react';

interface Bubble {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  wobble: number;
}

interface CausticRay {
  x: number;
  y: number;
  intensity: number;
  angle: number;
  length: number;
  speed: number;
}


interface UnderWaterSceneProps {
  children?: React.ReactNode;
}

export const UnderWaterScene: React.FC<UnderWaterSceneProps> = ({ children }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);

  // Animation state
  const bubblesRef = useRef<Bubble[]>([]);
  const causticRaysRef = useRef<CausticRay[]>([]);
  const timeRef = useRef(0);

  // Underwater color palette
  const colors = {
    // Ocean gradient: turquoise top → dark blue bottom
    gradientStops: [
      { offset: 0, color: '#40E0D0' },      // Turquoise
      { offset: 0.3, color: '#20B2AA' },    // Light sea green
      { offset: 0.6, color: '#4682B4' },    // Steel blue
      { offset: 1, color: '#191970' }       // Midnight blue
    ],
    bubbles: ['rgba(173, 216, 230, 0.8)', 'rgba(135, 206, 250, 0.9)', 'rgba(255, 255, 255, 0.7)'],
    caustics: ['rgba(255, 255, 255, 0.6)', 'rgba(173, 216, 230, 0.5)', 'rgba(135, 206, 250, 0.4)'],
    text: '#E0FFFF',
    textShadow: '#4682B4',
    buttonBg: 'rgba(32, 178, 170, 0.8)',
    buttonBorder: '#40E0D0',
    buttonText: '#FFFFFF'
  };

  // Initialize bubbles
  const initializeBubbles = useCallback((width: number, height: number) => {
    const bubbles: Bubble[] = [];
    for (let i = 0; i < 25; i++) {
      bubbles.push({
        x: Math.random() * width,
        y: height + Math.random() * 200, // Start below screen
        size: Math.random() * 8 + 2,
        speed: Math.random() * 0.5 + 0.3,
        opacity: Math.random() * 0.6 + 0.4,
        wobble: Math.random() * Math.PI * 2
      });
    }
    bubblesRef.current = bubbles;
  }, []);

  // Initialize caustic rays
  const initializeCaustics = useCallback((width: number) => {
    const rays: CausticRay[] = [];
    for (let i = 0; i < 15; i++) {
      rays.push({
        x: Math.random() * width,
        y: Math.random() * 200, // Top area of screen
        intensity: Math.random() * 0.8 + 0.2,
        angle: Math.random() * Math.PI / 4 - Math.PI / 8, // Slight angle variation
        length: Math.random() * 200 + 100,
        speed: Math.random() * 0.01 + 0.005
      });
    }
    causticRaysRef.current = rays;
  }, []);

  // Draw ocean gradient background
  const drawOceanGradient = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    colors.gradientStops.forEach(stop => {
      gradient.addColorStop(stop.offset, stop.color);
    });

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }, [colors]);

  // Draw animated bubbles
  const drawBubbles = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, deltaTime: number) => {
    bubblesRef.current.forEach((bubble, index) => {
      // Update bubble position
      bubble.y -= bubble.speed * deltaTime;
      bubble.wobble += 0.02 * deltaTime;
      bubble.x += Math.sin(bubble.wobble) * 0.5;

      // Reset bubble if it goes off screen
      if (bubble.y < -20) {
        bubble.y = height + 20;
        bubble.x = Math.random() * width;
      }

      // Draw bubble with pixel art style
      ctx.save();
      ctx.globalAlpha = bubble.opacity;

      // Bubble body
      ctx.fillStyle = colors.bubbles[index % colors.bubbles.length];
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
      ctx.fill();

      // Bubble highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(bubble.x - bubble.size * 0.3, bubble.y - bubble.size * 0.3, bubble.size * 0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }, [colors]);

  // Draw caustic light rays
  const drawCaustics = useCallback((ctx: CanvasRenderingContext2D, _width: number, _height: number, time: number) => {
    causticRaysRef.current.forEach(ray => {
      // Update ray properties
      ray.intensity = 0.5 + Math.sin(time * 0.001 + ray.x * 0.01) * 0.3;

      ctx.save();
      ctx.globalAlpha = ray.intensity;
      ctx.strokeStyle = colors.caustics[0];
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';

      // Draw wavy caustic ray
      ctx.beginPath();
      const segments = 20;
      for (let i = 0; i <= segments; i++) {
        const progress = i / segments;
        const x = ray.x + Math.sin(time * 0.002 + progress * 5) * 30;
        const y = ray.y + progress * ray.length;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      ctx.restore();
    });
  }, [colors]);

  // Draw floating SuiQ text with wave distortion
  const drawFloatingText = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    ctx.save();

    const centerX = width / 2;
    const centerY = height / 2 - 50;
    const fontSize = Math.min(width * 0.15, 120);

    // Apply wave distortion
    const waveOffset = Math.sin(time * 0.001) * 10;
    const floatOffset = Math.sin(time * 0.0008) * 15;

    // Draw text shadow for depth
    ctx.fillStyle = colors.textShadow;
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let dx = -3; dx <= 3; dx += 1) {
      for (let dy = -3; dy <= 3; dy += 1) {
        if (dx === 0 && dy === 0) continue;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= 3) {
          ctx.globalAlpha = 0.3 / distance;
          ctx.fillText('SuiQ', centerX + dx + waveOffset, centerY + dy + floatOffset);
        }
      }
    }

    // Draw main text
    ctx.globalAlpha = 1;
    ctx.fillStyle = colors.text;
    ctx.fillText('SuiQ', centerX + waveOffset, centerY + floatOffset);

    // Add shimmer effect
    const shimmerGradient = ctx.createLinearGradient(
      centerX - fontSize, centerY - fontSize/2,
      centerX + fontSize, centerY + fontSize/2
    );
    shimmerGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    shimmerGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
    shimmerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = shimmerGradient;
    ctx.fillText('SuiQ', centerX + waveOffset, centerY + floatOffset);

    ctx.restore();
  }, [colors]);



  // Main animation loop
  const animate = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;
    timeRef.current = timestamp;

    // Clear canvas and draw ocean gradient
    drawOceanGradient(ctx, canvas.width, canvas.height);

    // Draw caustic light rays
    drawCaustics(ctx, canvas.width, canvas.height, timestamp);

    // Draw floating bubbles
    drawBubbles(ctx, canvas.width, canvas.height, deltaTime);

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [drawOceanGradient, drawCaustics, drawBubbles, drawFloatingText]);

  // Canvas setup and initialization
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

      // Initialize particles
      initializeBubbles(canvas.width, canvas.height);
      initializeCaustics(canvas.width);
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
  }, [animate, initializeBubbles, initializeCaustics]);

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden'
    }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          imageRendering: 'pixelated'
        }}
      />
      {children}
    </div>
  );
};

export default UnderWaterScene;