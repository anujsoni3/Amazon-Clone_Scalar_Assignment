import React from 'react';
import { Star, StarHalf } from 'lucide-react';

const StarRating = ({ rating, count }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<Star key={i} size={16} fill="var(--color-star)" color="var(--color-star)" />);
    } else if (i === fullStars && hasHalfStar) {
      stars.push(<StarHalf key={i} size={16} fill="var(--color-star)" color="var(--color-star)" />);
    } else {
      stars.push(<Star key={i} size={16} color="var(--color-border)" />);
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <div style={{ display: 'flex' }}>{stars}</div>
      {count !== undefined && (
        <span style={{ fontSize: '12px', color: 'var(--color-link)' }}>
          {count}
        </span>
      )}
    </div>
  );
};

export default StarRating;
