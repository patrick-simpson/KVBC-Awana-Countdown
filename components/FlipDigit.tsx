import React, { useState, useEffect, useRef } from 'react';

interface FlipDigitProps {
  value: string;
}

export const FlipDigit: React.FC<FlipDigitProps> = ({ value }) => {
  const prevRef = useRef(value);
  const [animating, setAnimating] = useState(false);
  const [displayPrev, setDisplayPrev] = useState(value);
  const [flipKey, setFlipKey] = useState(0);

  useEffect(() => {
    if (value !== prevRef.current) {
      setDisplayPrev(prevRef.current);
      prevRef.current = value;
      setAnimating(true);
      setFlipKey(k => k + 1);
      const timer = setTimeout(() => setAnimating(false), 350);
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <span className="flip-digit">
      {animating && (
        <span key={`out-${flipKey}`} className="flip-digit-out">
          {displayPrev}
        </span>
      )}
      <span key={`in-${flipKey}`} className={animating ? 'flip-digit-in' : ''}>
        {value}
      </span>
    </span>
  );
};
