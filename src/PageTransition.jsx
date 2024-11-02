import React, { useEffect, useState } from 'react';
import './PageTransition.css';

function PageTransition({ children }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add state for loader visibility

  useEffect(() => {
    // Delay the mounting of the children to allow for fade-in transition
    setTimeout(() => {
      setIsMounted(true);
    }, 100);
  }, []);

  const handleTransitionEnd = () => {
    setIsLoading(false);
  };

  return (
    <div
      className={`page-transition ${isMounted ? 'page-transition--mounted' : ''}`}
      onTransitionEnd={handleTransitionEnd}// Listen for transition end
    >
      {children}
    </div>
  );
}

export default PageTransition;
