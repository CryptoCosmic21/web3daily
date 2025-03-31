import React from 'react';
import Particles from '@tsparticles/react';
import { loadFull } from 'tsparticles';

export default function ParticleBackground() {
  const particlesInit = async (engine) => {
    // This loads the tsparticles package bundle, which includes all features
    await loadFull(engine);
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        background: {
          color: { value: "#000000" }
        },
        fpsLimit: 60,
        interactivity: {
          events: {
            onClick: { enable: true, mode: "push" },
            onHover: { enable: true, mode: "repulse" },
            resize: true
          }
        },
        particles: {
          color: { value: "#ffffff" },
          links: {
            enable: true,
            distance: 150,
            color: "#ffffff",
            opacity: 0.1,
            width: 1
          },
          collisions: { enable: false },
          move: {
            enable: true,
            speed: 1,
            direction: "none",
            random: false,
            straight: false,
            outModes: "bounce"
          },
          number: {
            density: { enable: true, area: 800 },
            value: 80
          },
          opacity: { value: 0.5 },
          shape: { type: "circle" },
          size: { value: 3, random: true }
        },
        detectRetina: true
      }}
    />
  );
}
