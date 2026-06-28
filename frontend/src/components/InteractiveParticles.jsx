import React, { useEffect, useRef } from 'react';

/**
 * Interactive HTML Canvas component that renders a premium 3D floating particle constellation.
 * Reacts to mouse movements by shifting particle perspectives in 3D parallax.
 */
export default function InteractiveParticles({ particleColor = 'rgba(217, 4, 41, 0.25)', lineColor = 'rgba(217, 4, 41, 0.08)', density = 60 }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width || window.innerWidth;
      canvas.height = rect.height || 600;
      initParticles();
    };

    class Particle {
      constructor(width, height) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        // Z coordinate determines depth, size, speed, and parallax response
        this.z = Math.random() * 1.5 + 0.5; 
        
        this.vx = (Math.random() - 0.5) * 0.4 / this.z;
        this.vy = (Math.random() - 0.5) * 0.4 / this.z;
        
        this.radius = Math.max(0.8, (Math.random() * 2 + 1) * this.z);
        this.alpha = Math.max(0.15, Math.random() * 0.6);
      }

      update(width, height, mouseX, mouseY) {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around boundaries
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        // Apply mouse 3D parallax shifting based on depth (Z)
        // Deeper particles (high Z) move less, closer particles (low Z) move more
        const shiftX = mouseX * 25 * (1 / this.z);
        const shiftY = mouseY * 25 * (1 / this.z);

        this.renderX = this.x + shiftX;
        this.renderY = this.y + shiftY;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.renderX, this.renderY, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = particleColor.replace(/[\d.]+\)$/, `${this.alpha})`);
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      const count = Math.floor((canvas.width * canvas.height) / 18000) || density;
      // Cap at 100 particles for performance
      const safeCount = Math.min(100, Math.max(25, count));
      for (let i = 0; i < safeCount; i++) {
        particles.push(new Particle(canvas.width, canvas.height));
      }
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate normalized mouse offsets from center (-1 to 1)
      mouseRef.current.targetX = (x / rect.width) - 0.5;
      mouseRef.current.targetY = (y / rect.height) - 0.5;
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
    };

    // Listen to parent mouse moves
    const parent = canvas.parentElement;
    parent.addEventListener('mousemove', handleMouseMove);
    parent.addEventListener('mouseleave', handleMouseLeave);
    
    // Initial size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation Loop
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Smooth mouse lerping
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Update and draw particles
      particles.forEach(p => {
        p.update(canvas.width, canvas.height, mouse.x, mouse.y);
        p.draw();
      });

      // Draw constellation links
      ctx.lineWidth = 0.55;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].renderX - particles[j].renderX;
          const dy = particles[i].renderY - particles[j].renderY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const alpha = (1 - dist / 110) * 0.25;
            ctx.beginPath();
            ctx.moveTo(particles[i].renderX, particles[i].renderY);
            ctx.lineTo(particles[j].renderX, particles[j].renderY);
            ctx.strokeStyle = lineColor.replace(/[\d.]+\)$/, `${alpha})`);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      parent.removeEventListener('mousemove', handleMouseMove);
      parent.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [particleColor, lineColor, density]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
}
