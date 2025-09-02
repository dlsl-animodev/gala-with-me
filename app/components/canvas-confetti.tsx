"use client";

import { useRef, useEffect, useCallback } from "react";

interface ConfettiParticle {
  x: number;
  y: number;
  size: number;
  color: string;
  velocity: {
    x: number;
    y: number;
  };
  rotation: number;
  rotationSpeed: number;
  gravity: number;
  opacity: number;
  shape: "circle" | "square" | "triangle";
}

interface CanvasConfettiProps {
  className?: string;
  isActive?: boolean;
  duration?: number;
  particleCount?: number;
  colors?: string[];
}

export default function CanvasConfetti({
  className = "",
  isActive = false,
  duration = 5000,
  particleCount = 100,
  colors = [
    "#fb923c",
    "#f97316",
    "#ea580c",
    "#fbbf24",
    "#facc15",
    "#a3e635",
    "#d946ef",
    "#818cf8",
  ],
}: CanvasConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<ConfettiParticle[]>([]);
  const animationRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(isActive);

  // Create confetti particles
  const createConfetti = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const particles: ConfettiParticle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const size = 5 + Math.random() * 10;
      const shape =
        Math.random() < 0.33
          ? "circle"
          : Math.random() < 0.66
          ? "square"
          : "triangle";

      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.5, // Start in top half
        size,
        color: colors[Math.floor(Math.random() * colors.length)],
        velocity: {
          x: (Math.random() - 0.5) * 8,
          y: Math.random() * 3 + 2,
        },
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        gravity: 0.1 + Math.random() * 0.1,
        opacity: 1,
        shape,
      });
    }

    particlesRef.current = particles;
  }, [particleCount, colors]);
  // Update isActiveRef when props change
  useEffect(() => {
    isActiveRef.current = isActive;
    if (isActive) {
      createConfetti();

      // Stop after duration
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        isActiveRef.current = false;
      }, duration);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isActive, duration, createConfetti]);

  const drawParticle = (
    ctx: CanvasRenderingContext2D,
    particle: ConfettiParticle
  ) => {
    ctx.save();
    ctx.translate(particle.x, particle.y);
    ctx.rotate((particle.rotation * Math.PI) / 180);
    ctx.globalAlpha = particle.opacity;
    ctx.fillStyle = particle.color;

    switch (particle.shape) {
      case "circle":
        ctx.beginPath();
        ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      case "square":
        ctx.fillRect(
          -particle.size / 2,
          -particle.size / 2,
          particle.size,
          particle.size
        );
        break;
      case "triangle":
        ctx.beginPath();
        ctx.moveTo(0, -particle.size / 2);
        ctx.lineTo(particle.size / 2, particle.size / 2);
        ctx.lineTo(-particle.size / 2, particle.size / 2);
        ctx.closePath();
        ctx.fill();
        break;
    }

    ctx.restore();
  };

  // Animation function
  const startAnimation = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      if (!canvasRef.current) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create new confetti if active
      if (isActiveRef.current && particlesRef.current.length < particleCount) {
        createConfetti();
      }

      // Update and draw particles
      const particles = particlesRef.current;
      const activeParticles: ConfettiParticle[] = [];

      for (const particle of particles) {
        // Update position
        particle.x += particle.velocity.x;
        particle.y += particle.velocity.y;

        // Apply gravity and drag
        particle.velocity.y += particle.gravity;
        particle.velocity.x *= 0.99;

        // Update rotation
        particle.rotation += particle.rotationSpeed;

        // Fade out particles
        if (!isActiveRef.current) {
          particle.opacity -= 0.01;
        }

        // Remove if out of bounds or invisible
        if (
          particle.y > canvas.height + particle.size ||
          particle.x < -particle.size ||
          particle.x > canvas.width + particle.size ||
          particle.opacity <= 0
        ) {
          continue; // Don't add to active particles
        }

        // Draw the particle
        drawParticle(ctx, particle);

        // Keep active particles
        activeParticles.push(particle);
      }

      // Update active particles
      particlesRef.current = activeParticles;

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  }, [createConfetti, particleCount]);

  // Initialize canvas and start animation
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    // Start animation
    startAnimation();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationRef.current);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [startAnimation]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-50 ${className}`}
    />
  );
}
