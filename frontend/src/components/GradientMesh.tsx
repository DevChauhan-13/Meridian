import React from 'react';

export const GradientMesh: React.FC = () => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '540px',
        overflow: 'hidden',
        zIndex: 0,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 540"
        preserveAspectRatio="xMidYMin slice"
        style={{ width: '100%', height: '100%' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="mesh-cream" cx="15%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#f5e9d4" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#f5e9d4" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="mesh-indigo" cx="72%" cy="25%" r="55%">
            <stop offset="0%" stopColor="#533afd" stopOpacity="0.55" />
            <stop offset="60%" stopColor="#665efd" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#533afd" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="mesh-ruby" cx="88%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ea2261" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#ea2261" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="mesh-magenta" cx="50%" cy="15%" r="45%">
            <stop offset="0%" stopColor="#f96bee" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f96bee" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="mesh-lavender" cx="35%" cy="65%" r="55%">
            <stop offset="0%" stopColor="#b9b9f9" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#b9b9f9" stopOpacity="0" />
          </radialGradient>
          <filter id="mesh-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="70" />
          </filter>
        </defs>
        <g filter="url(#mesh-blur)">
          <ellipse cx="200" cy="180" rx="360" ry="260" fill="url(#mesh-cream)" />
          <ellipse cx="1020" cy="140" rx="420" ry="290" fill="url(#mesh-indigo)" />
          <ellipse cx="1280" cy="280" rx="300" ry="220" fill="url(#mesh-ruby)" />
          <ellipse cx="680" cy="90" rx="380" ry="220" fill="url(#mesh-magenta)" />
          <ellipse cx="440" cy="320" rx="320" ry="240" fill="url(#mesh-lavender)" />
        </g>
      </svg>
    </div>
  );
};
