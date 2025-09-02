"use client";

import { useRef, useEffect } from "react";

interface BackgroundBubble {
  x: number;
  y: number;
  radius: number;
  dx: number;
  dy: number;
  color: string;
  opacity: number;
}

interface CanvasBackgroundProps {
  className?: string;
  bubbleCount?: number;
}

export default function CanvasBackground({
  className = "",
  bubbleCount = 15,
}: CanvasBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const bubblesRef = useRef<BackgroundBubble[]>([]);

  // Initialize bubbles
  useEffect(() => {
    const bubbles: BackgroundBubble[] = [];

    for (let i = 0; i < bubbleCount; i++) {
      bubbles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: 8 + Math.random() * 12, // Radius between 8-20
        dx: (Math.random() - 0.5) * 0.5, // Horizontal velocity
        dy: (Math.random() - 0.5) * 0.5, // Vertical velocity
        color: getOrangeGradient(Math.random()),
        opacity: 0.1 + Math.random() * 0.1, // Low opacity between 0.1-0.2
      });
    }

    bubblesRef.current = bubbles;

    // Start animation
    startAnimation();

    // Handle resize
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [bubbleCount]);

  // Helper function to get orange gradient colors
  const getOrangeGradient = (value: number) => {
    const colors = [
      "#fb923c", // orange-400
      "#f97316", // orange-500
      "#ea580c", // orange-600
      "#fbbf24", // amber-400
    ];

    const index = Math.floor(value * colors.length);
    return colors[index];
  };

  const startAnimation = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      if (!canvasRef.current) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw bubbles
      for (const bubble of bubblesRef.current) {
        // Update position
        bubble.x += bubble.dx;
        bubble.y += bubble.dy;

        // Bounce off edges
        if (
          bubble.x - bubble.radius < 0 ||
          bubble.x + bubble.radius > canvas.width
        ) {
          bubble.dx = -bubble.dx;
        }

        if (
          bubble.y - bubble.radius < 0 ||
          bubble.y + bubble.radius > canvas.height
        ) {
          bubble.dy = -bubble.dy;
        }

        // Draw bubble
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
        ctx.fillStyle = bubble.color;
        ctx.globalAlpha = bubble.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
    />
  );
}
