import React from 'react';
import { WeatherType } from '../hooks/useWeather';

interface WeatherSceneProps {
  weather: WeatherType;
}

// Raindrops - angled lines
const RAINDROPS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  duration: `${1.5 + Math.random() * 1.5}s`,
  delay: `${-Math.random() * 2}s`,
  size: `${2 + Math.random() * 2}px`,
  opacity: 0.3 + Math.random() * 0.3,
}));

// Snowflakes
const SNOWFLAKES = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  duration: `${8 + Math.random() * 4}s`,
  delay: `${-Math.random() * 8}s`,
  size: `${8 + Math.random() * 12}px`,
  opacity: 0.6 + Math.random() * 0.3,
  wobble: 20 + Math.random() * 20,
}));

// Cloud shapes
const CLOUDS = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  top: `${10 + Math.random() * 60}%`,
  duration: `${20 + Math.random() * 10}s`,
  delay: `${-Math.random() * 20}s`,
  size: `${100 + Math.random() * 80}px`,
  opacity: 0.4 + Math.random() * 0.2,
}));

// Fog blobs
const FOG_BLOBS = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  top: `${Math.random() * 100}%`,
  duration: `${30 + Math.random() * 15}s`,
  delay: `${-Math.random() * 30}s`,
  size: `${200 + Math.random() * 150}px`,
  opacity: 0.15 + Math.random() * 0.1,
}));

// Sun rays
const SUN_RAYS = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  angle: (i * 45),
}));

// Birds
const BIRDS = Array.from({ length: 3 }, (_, i) => ({
  id: i,
  startY: 10 + Math.random() * 40,
  duration: `${8 + Math.random() * 4}s`,
  delay: `${i * 3}s`,
}));

export const WeatherScene: React.FC<WeatherSceneProps> = ({ weather }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Rain */}
      {weather === 'rain' && (
        <div className="absolute inset-0">
          {RAINDROPS.map(drop => (
            <div
              key={drop.id}
              className="absolute bg-blue-300"
              style={{
                left: drop.left,
                width: drop.size,
                height: '30px',
                opacity: drop.opacity,
                transform: 'rotate(20deg)',
                animation: `rainFall ${drop.duration} linear infinite`,
                animationDelay: drop.delay,
              }}
            />
          ))}
        </div>
      )}

      {/* Snow */}
      {weather === 'snow' && (
        <div className="absolute inset-0">
          {SNOWFLAKES.map(flake => (
            <div
              key={flake.id}
              className="absolute rounded-full bg-white"
              style={{
                left: flake.left,
                width: flake.size,
                height: flake.size,
                opacity: flake.opacity,
                animation: `snowFall ${flake.duration} ease-in infinite`,
                animationDelay: flake.delay,
              }}
            />
          ))}
        </div>
      )}

      {/* Thunder (rain + flash) */}
      {weather === 'thunder' && (
        <>
          <div className="absolute inset-0">
            {RAINDROPS.map(drop => (
              <div
                key={drop.id}
                className="absolute bg-blue-300"
                style={{
                  left: drop.left,
                  width: drop.size,
                  height: '30px',
                  opacity: drop.opacity * 0.8,
                  transform: 'rotate(20deg)',
                  animation: `rainFall ${drop.duration} linear infinite`,
                  animationDelay: drop.delay,
                }}
              />
            ))}
          </div>
          {/* Lightning flash overlay */}
          <div
            className="absolute inset-0 bg-white"
            style={{
              animation: `thunderFlash 8s ease-in-out infinite`,
            }}
          />
        </>
      )}

      {/* Cloudy */}
      {weather === 'cloudy' && (
        <div className="absolute inset-0">
          {CLOUDS.map(cloud => (
            <div
              key={cloud.id}
              className="absolute rounded-full bg-white"
              style={{
                top: cloud.top,
                width: cloud.size,
                height: `${Math.round(cloud.size * 0.5)}px`,
                opacity: cloud.opacity,
                animation: `cloudDrift ${cloud.duration} ease-in-out infinite`,
                animationDelay: cloud.delay,
                filter: 'blur(30px)',
              }}
            />
          ))}
        </div>
      )}

      {/* Fog */}
      {weather === 'fog' && (
        <div className="absolute inset-0">
          {FOG_BLOBS.map(blob => (
            <div
              key={blob.id}
              className="absolute rounded-full bg-white"
              style={{
                top: blob.top,
                left: '-150px',
                width: blob.size,
                height: blob.size,
                opacity: blob.opacity,
                animation: `cloudDrift ${blob.duration} ease-in-out infinite`,
                animationDelay: blob.delay,
                filter: 'blur(60px)',
              }}
            />
          ))}
        </div>
      )}

      {/* Clear/Sunny */}
      {weather === 'clear' && (
        <>
          {/* Sun rays */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: 0.08 }}>
            <div
              style={{
                width: '150px',
                height: '150px',
                animation: 'sunRay 30s linear infinite',
              }}
            >
              {SUN_RAYS.map(ray => (
                <div
                  key={ray.id}
                  className="absolute bg-yellow-300"
                  style={{
                    left: '50%',
                    top: '-30px',
                    width: '4px',
                    height: '40px',
                    transform: `translateX(-50%) rotate(${ray.angle}deg)`,
                    transformOrigin: '0 150px',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Flying birds */}
          {BIRDS.map(bird => (
            <div
              key={bird.id}
              className="absolute text-2xl"
              style={{
                top: `${bird.startY}%`,
                left: '-50px',
                animation: `birdFly ${bird.duration} linear infinite`,
                animationDelay: bird.delay,
                opacity: 0.6,
              }}
            >
              🐦
            </div>
          ))}
        </>
      )}
    </div>
  );
};
