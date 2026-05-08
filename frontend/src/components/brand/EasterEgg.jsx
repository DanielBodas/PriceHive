import React, { useState, useEffect } from 'react';
import BrandMark from './BrandMark';

const EasterEgg = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    // Appear randomly every 30-60 seconds for a short duration
    const triggerEasterEgg = () => {
      if (!isVisible) {
        setIsVisible(true);
        setTimeout(() => setIsVisible(false), 5000); // Visible for 5 seconds
      }
    };

    const interval = setInterval(triggerEasterEgg, Math.random() * 30000 + 30000);
    return () => clearInterval(interval);
  }, [isVisible]);

  const handleClick = () => {
    setShowMessage(true);
    setIsVisible(false);
    setTimeout(() => setShowMessage(false), 4000);
  };

  if (!isVisible && !showMessage) return null;

  return (
    <>
      {isVisible && (
        <div
          className="fixed bottom-8 right-8 z-50 cursor-pointer p-3 bg-white rounded-full shadow-lg border border-primary/20 text-primary hover:bg-primary/5 transition-all duration-300 animate-in fade-in zoom-in scale-100"
          onClick={handleClick}
          style={{ animationDuration: '300ms' }}
        >
          <BrandMark className="w-6 h-6 animate-pulse" />
        </div>
      )}

      {showMessage && (
        <div
          className="fixed bottom-24 right-8 z-50 bg-primary text-primary-foreground px-6 py-3 rounded-2xl shadow-xl font-heading font-semibold animate-in fade-in slide-in-from-bottom-5"
          style={{ animationDuration: '400ms' }}
        >
          🐝 ¡Bzzzt! Has encontrado una Colmena Premium. ¡Sigue ahorrando con inteligencia!
        </div>
      )}
    </>
  );
};

export default EasterEgg;
