import React from 'react';

interface BrandBarProps {
  height?: number;
}

export const BrandBar: React.FC<BrandBarProps> = ({ height = 4 }) => (
  <div
    className="brand-bar-animated flex-shrink-0 w-full"
    style={{ height: `${height}px` }}
  />
);
