import React, { useEffect, useRef } from 'react';

export default function ThreeDCityscape({ lineColor = 'rgba(99, 102, 241, 0.25)' }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let buildings = [];

    const resizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width || window.innerWidth;
      canvas.height = rect.height || 600;
      initCityscape();
    };

    // Define mock buildings in 3D space
    // x: -200 to 200, y (height offset): base is ground, z (depth): 50 to 500
    class Building3D {
      constructor(canvasWidth) {
        this.reset(canvasWidth, true);
      }

      reset(canvasWidth, initial = false) {
        this.w = Math.random() * 40 + 25;
        this.h = Math.random() * 150 + 80;
        this.d = Math.random() * 40 + 25;

        // Position coordinates in 3D
        this.x = (Math.random() - 0.5) * (canvasWidth * 0.8);
        this.z = initial ? Math.random() * 450 + 50 : 500;
        this.y = 120; // ground base offset
        
        // Neon color tag
        this.colorSeed = Math.random();
      }

      update(speed, canvasWidth) {
        // Move building closer (moving along Z axis)
        this.z -= speed;
        if (this.z <= 10) {
          this.reset(canvasWidth, false);
        }
      }

      draw(width, height, mouseX, mouseY) {
        const centerX = width / 2;
        const centerY = height / 2;
        const focalLength = 300;

        // Apply mouse camera coordinates panning
        const camX = mouseX * 80;
        const camY = mouseY * 50;

        // Project 3D points to 2D screen coordinates
        const project = (px, py, pz) => {
          const scale = focalLength / (focalLength + pz);
          return {
            x: centerX + (px - camX) * scale,
            y: centerY + (py - camY) * scale,
            scale: scale
          };
        };

        // Determine building 8 corners in 3D space
        const halfW = this.w / 2;
        const halfD = this.d / 2;

        const corners3d = [
          { x: this.x - halfW, y: this.y, z: this.z - halfD },          // 0: Bottom front left
          { x: this.x + halfW, y: this.y, z: this.z - halfD },          // 1: Bottom front right
          { x: this.x + halfW, y: this.y - this.h, z: this.z - halfD }, // 2: Top front right
          { x: this.x - halfW, y: this.y - this.h, z: this.z - halfD }, // 3: Top front left
          { x: this.x - halfW, y: this.y, z: this.z + halfD },          // 4: Bottom back left
          { x: this.x + halfW, y: this.y, z: this.z + halfD },          // 5: Bottom back right
          { x: this.x + halfW, y: this.y - this.h, z: this.z + halfD }, // 6: Top back right
          { x: this.x - halfW, y: this.y - this.h, z: this.z + halfD }  // 7: Top back left
        ];

        const corners2d = corners3d.map(c => project(c.x, c.y, c.z));

        // Fade out lines at far distance (Z close to 500)
        const alpha = Math.max(0, Math.min(0.35, (1 - this.z / 500) * 0.35));
        
        ctx.strokeStyle = this.colorSeed > 0.5 
          ? `rgba(99, 102, 241, ${alpha})` // Indigo neon
          : `rgba(168, 85, 247, ${alpha})`; // Purple neon
        
        ctx.lineWidth = 1 + (focalLength / (focalLength + this.z)) * 0.8;

        const drawEdge = (idxA, idxB) => {
          ctx.beginPath();
          ctx.moveTo(corners2d[idxA].x, corners2d[idxA].y);
          ctx.lineTo(corners2d[idxB].x, corners2d[idxB].y);
          ctx.stroke();
        };

        // Draw Front face edges
        drawEdge(0, 1); drawEdge(1, 2); drawEdge(2, 3); drawEdge(3, 0);
        // Draw Back face edges
        drawEdge(4, 5); drawEdge(5, 6); drawEdge(6, 7); drawEdge(7, 4);
        // Draw connecting side edges
        drawEdge(0, 4); drawEdge(1, 5); drawEdge(2, 6); drawEdge(3, 7);
      }
    }

    const initCityscape = () => {
      buildings = [];
      const count = 18;
      for (let i = 0; i < count; i++) {
        buildings.push(new Building3D(canvas.width));
      }
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouseRef.current.targetX = (x / rect.width) - 0.5;
      mouseRef.current.targetY = (y / rect.height) - 0.5;
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
    };

    const parent = canvas.parentElement;
    parent.addEventListener('mousemove', handleMouseMove);
    parent.addEventListener('mouseleave', handleMouseLeave);
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Lerping mouse
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      // Draw wireframe grid ground in 3D perspective
      ctx.strokeStyle = 'rgba(255,255,255,0.015)';
      ctx.lineWidth = 1;
      const centerY = canvas.height / 2;
      const startGroundY = centerY + 120 * (300 / (300 + 50));
      ctx.beginPath();
      ctx.moveTo(0, startGroundY);
      ctx.lineTo(canvas.width, startGroundY);
      ctx.stroke();

      // Update and draw buildings
      buildings.sort((a, b) => b.z - a.z); // Draw back buildings first
      buildings.forEach(b => {
        b.update(0.85, canvas.width);
        b.draw(canvas.width, canvas.height, mouse.x, mouse.y);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      parent.removeEventListener('mousemove', handleMouseMove);
      parent.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [lineColor]);

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
