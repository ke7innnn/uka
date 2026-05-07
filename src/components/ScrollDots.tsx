"use client";

import { useRef, useEffect } from "react";

export default function ScrollDots() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Dot class with spring physics
    class Dot {
      x: number;
      y: number;
      originX: number;
      originY: number;
      vx: number = 0;
      vy: number = 0;
      radius: number;
      friction = 0.8;
      springFactor = 0.05;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.originX = this.x;
        this.originY = this.y;
        this.radius = Math.random() * 3 + 1;
      }

      update(mouse: { x: number; y: number; radius: number }) {
        // Repel from mouse
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          const forceDirectionX = dx / dist;
          const forceDirectionY = dy / dist;
          const force = (mouse.radius - dist) / mouse.radius;
          const forceX = forceDirectionX * force * 5;
          const forceY = forceDirectionY * force * 5;
          this.vx += forceX;
          this.vy += forceY;
        }

        // Return to origin with spring physics
        const dxOrigin = this.originX - this.x;
        const dyOrigin = this.originY - this.y;
        this.vx += dxOrigin * this.springFactor;
        this.vy += dyOrigin * this.springFactor;

        this.vx *= this.friction;
        this.vy *= this.friction;

        this.x += this.vx;
        this.y += this.vy;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fill();
        ctx.closePath();
      }
    }

    const dots: Dot[] = [];
    for (let i = 0; i < 60; i++) {
      dots.push(new Dot());
    }

    const mouse = {
      x: -1000,
      y: -1000,
      radius: 100,
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Need to adjust for canvas bounding rect in case of horizontal scroll
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      dots.forEach((dot) => {
        dot.update(mouse);
        dot.draw();
      });
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
}
