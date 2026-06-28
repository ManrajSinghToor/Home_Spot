import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageTransition from '../components/PageTransition';

const ROOM_DATA = {
  living: {
    name: 'Modern Punjabi Living Room',
    desc: 'Spacious, high-ceiling layout combining traditional elegance with smart features.',
    bg: 'radial-gradient(circle at center, #1b1b24, #0b0b0f)',
    hotspots: [
      { id: 1, x: 25, y: 40, label: 'Smart Ambient Lighting', desc: 'Customizable Philips Hue network integrated into handcrafted plaster molding.' },
      { id: 2, x: 50, y: 75, label: 'Italian Marble Flooring', desc: 'Premium Statuario marble with radiant underfloor heating for cool winter mornings.' },
      { id: 3, x: 75, y: 35, label: '8K Entertainment System', desc: 'Ultra-thin wall flush mount with Dolby Atmos ceiling-integrated speaker array.' }
    ]
  },
  kitchen: {
    name: 'Premium Modular Kitchen',
    desc: 'Ergonomic chef kitchen outfitted with premium smart appliances and matte charcoal cabinetry.',
    bg: 'radial-gradient(circle at center, #241b1b, #0f0b0b)',
    hotspots: [
      { id: 4, x: 30, y: 55, label: 'Quartz Countertops', desc: 'Zero-porosity white quartz slab with seamless integrated double-bowl sink.' },
      { id: 5, x: 65, y: 30, label: 'Smart Multi-Zone Fridge', desc: 'Built-in Wi-Fi enabled refrigeration cabinet with custom ingredient trackers.' },
      { id: 6, x: 80, y: 65, label: 'Induction Cooktop & Hood', desc: 'Downdraft touch-induction unit with automated heat exhaust regulation.' }
    ]
  },
  bedroom: {
    name: 'Executive Master Suite',
    desc: 'A sanctuary of comfort featuring private terrace access and customized walk-in dresser.',
    bg: 'radial-gradient(circle at center, #1b241b, #0b0f0b)',
    hotspots: [
      { id: 7, x: 40, y: 45, label: 'King Size Memory Bed', desc: 'Zero-gravity orthopedic mattress with automated incline settings.' },
      { id: 8, x: 15, y: 25, label: 'Panoramic Balcony View', desc: 'Floor-to-ceiling double glazed glass sliding panels opening to a private garden deck.' },
      { id: 9, x: 85, y: 50, label: 'Walk-In Wardrobe', desc: 'Bespoke walnut wardrobes with motion-sensor internal LED bars.' }
    ]
  }
};

export default function VirtualTour() {
  const [activeRoom, setActiveRoom] = useState('living');
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const canvasRef = useRef(null);
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, rotationX: 0, rotationY: 0, targetRotationX: 0, targetRotationY: 0 });

  const room = ROOM_DATA[activeRoom];

  // Canvas drawing loop representing simulated 3D room framework (wireframe grid that moves with drag)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;

    const resize = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const d = dragRef.current;

      // Smooth rotation lerping
      d.rotationX += (d.targetRotationX - d.rotationX) * 0.1;
      d.rotationY += (d.targetRotationY - d.rotationY) * 0.1;

      // Draw grid lines in pseudo 3D space
      ctx.strokeStyle = activeRoom === 'living' ? 'rgba(99, 102, 241, 0.12)' : activeRoom === 'kitchen' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)';
      ctx.lineWidth = 1.5;

      const cols = 20;
      const rows = 12;
      const cellW = canvas.width / cols;
      const cellH = canvas.height / rows;

      // Distort grid coordinates based on rotation
      for (let i = 0; i <= cols; i++) {
        ctx.beginPath();
        for (let j = 0; j <= rows; j++) {
          const baseX = i * cellW;
          const baseY = j * cellH;

          // Apply 3D perspective projection formula relative to center
          const dx = baseX - canvas.width / 2;
          const dy = baseY - canvas.height / 2;

          // Simulated 3D matrix math (spherical projection)
          const angle = Math.atan2(dy, dx);
          const dist = Math.sqrt(dx * dx + dy * dy);
          const newDist = dist * (1 + (d.rotationX / 1000) * Math.cos(angle) + (d.rotationY / 1000) * Math.sin(angle));

          const px = canvas.width / 2 + Math.cos(angle) * newDist + d.rotationX * 0.6;
          const py = canvas.height / 2 + Math.sin(angle) * newDist + d.rotationY * 0.6;

          if (j === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      for (let j = 0; j <= rows; j++) {
        ctx.beginPath();
        for (let i = 0; i <= cols; i++) {
          const baseX = i * cellW;
          const baseY = j * cellH;

          const dx = baseX - canvas.width / 2;
          const dy = baseY - canvas.height / 2;

          const angle = Math.atan2(dy, dx);
          const dist = Math.sqrt(dx * dx + dy * dy);
          const newDist = dist * (1 + (d.rotationX / 1000) * Math.cos(angle) + (d.rotationY / 1000) * Math.sin(angle));

          const px = canvas.width / 2 + Math.cos(angle) * newDist + d.rotationX * 0.6;
          const py = canvas.height / 2 + Math.sin(angle) * newDist + d.rotationY * 0.6;

          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // Draw floating particles to look immersive
      ctx.fillStyle = activeRoom === 'living' ? 'rgba(99, 102, 241, 0.4)' : activeRoom === 'kitchen' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)';
      for (let k = 0; k < 15; k++) {
        const seed = k * 12345;
        const bx = ((seed % 100) / 100) * canvas.width;
        const by = (((seed + d.rotationY * 5) % 100) / 100) * canvas.height;
        ctx.beginPath();
        ctx.arc(bx + d.rotationX * 0.2, by, 2 + (seed % 3), 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [activeRoom]);

  // Handle Dragging / Looking Around
  const handleMouseDown = (e) => {
    dragRef.current.isDragging = true;
    dragRef.current.startX = e.clientX;
    dragRef.current.startY = e.clientY;
  };

  const handleMouseMove = (e) => {
    if (!dragRef.current.isDragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    
    // Set targets with constraints
    dragRef.current.targetRotationX = Math.max(-120, Math.min(120, dragRef.current.targetRotationX + dx * 0.25));
    dragRef.current.targetRotationY = Math.max(-80, Math.min(80, dragRef.current.targetRotationY + dy * 0.25));
    
    dragRef.current.startX = e.clientX;
    dragRef.current.startY = e.clientY;
  };

  const handleMouseUp = () => {
    dragRef.current.isDragging = false;
  };

  return (
    <PageTransition>
      <Header />
      <main style={{ background: '#09090b', minHeight: '90vh', padding: '60px 0', position: 'relative' }}>
        <div className="grid-bg"></div>

        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="tour-intro"
            style={{ marginBottom: '40px' }}
          >
            <h1 className="neon-text" style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '15px' }}>Immersive 3D Space Tour</h1>
            <p style={{ color: '#a1a1aa', maxWidth: '600px', margin: '0 auto' }}>
              Interact directly with this property. Drag your mouse over the screen below to rotate the camera perspective in 3D and tap hotspots to view specifications.
            </p>
          </motion.div>

          {/* Room Selection Buttons */}
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '30px' }}>
            {Object.keys(ROOM_DATA).map((roomKey) => (
              <button
                key={roomKey}
                onClick={() => {
                  setActiveRoom(roomKey);
                  setSelectedHotspot(null);
                  dragRef.current.targetRotationX = 0;
                  dragRef.current.targetRotationY = 0;
                }}
                className="glow-btn"
                style={{
                  padding: '12px 24px',
                  background: activeRoom === roomKey ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${activeRoom === roomKey ? 'var(--primary-color)' : 'rgba(255,255,255,0.08)'}`,
                  color: '#fff',
                  borderRadius: '30px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {roomKey.charAt(0).toUpperCase() + roomKey.slice(1)} Room
              </button>
            ))}
          </div>

          {/* Interactive Screen */}
          <div 
            className="panorama-view neon-border"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              background: room.bg,
              cursor: dragRef.current.isDragging ? 'grabbing' : 'grab',
              userSelect: 'none',
              position: 'relative'
            }}
          >
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', pointerEvents: 'none' }} />

            {/* Glowing Hotspots overlay */}
            <AnimatePresence>
              {room.hotspots.map((spot) => {
                // Adjust position dynamically with simple 3D camera rotation shifts
                // Basic formula: base position + camera offset factor
                return (
                  <motion.button
                    key={spot.id}
                    onClick={() => setSelectedHotspot(spot)}
                    className="panorama-hotspot"
                    style={{
                      left: `calc(${spot.x}% + ${dragRef.current.targetRotationX * 0.4}px)`,
                      top: `calc(${spot.y}% + ${dragRef.current.targetRotationY * 0.4}px)`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <i className="fas fa-plus"></i>
                  </motion.button>
                );
              })}
            </AnimatePresence>

            {/* Floating details popup inside screen */}
            <AnimatePresence>
              {selectedHotspot && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="glass-panel"
                  style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    width: '300px',
                    padding: '20px',
                    zIndex: 30,
                    textAlign: 'left',
                    background: 'rgba(15, 15, 20, 0.9)',
                    border: '1px solid rgba(99, 102, 241, 0.4)'
                  }}
                >
                  <button 
                    onClick={() => setSelectedHotspot(null)}
                    style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', fontSize: '1rem' }}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                  <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-color)' }}></span>
                    {selectedHotspot.label}
                  </h4>
                  <p style={{ color: '#a1a1aa', fontSize: '0.85rem', lineHeight: '1.6' }}>{selectedHotspot.desc}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Room description label */}
            <div className="panorama-overlay glass-panel" style={{ border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '600', marginBottom: '5px' }}>{room.name}</h3>
              <p style={{ color: '#a1a1aa', fontSize: '0.9rem', margin: 0 }}>{room.desc}</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
}
