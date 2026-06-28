import React, { useRef, useState } from 'react';

/**
 * Reusable wrapper that adds a smooth 3D tilt effect on mouse hover.
 * Uses vanilla React mouse handlers and CSS 3D perspectives.
 */
export default function ThreeDTilt({ children, className = '', style = {}, maxTilt = 10, scale = 1.03, ...rest }) {
  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({});

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const box = card.getBoundingClientRect();
    
    // Get mouse position relative to the element bounding box
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    
    // Convert to percentage offsets from center (-0.5 to 0.5)
    const px = (x / box.width) - 0.5;
    const py = (y / box.height) - 0.5;
    
    // Calculate rotation angles (in degrees)
    // Moving mouse to the right rotates around Y-axis positively
    // Moving mouse to the bottom rotates around X-axis negatively
    const rotateX = -py * maxTilt;
    const rotateY = px * maxTilt;
    
    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`,
      transition: 'transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)',
      zIndex: 5
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
    });
  };

  return (
    <div
      ref={cardRef}
      className={className}
      style={{
        ...style,
        transformStyle: 'preserve-3d',
        ...tiltStyle
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      {children}
    </div>
  );
}
