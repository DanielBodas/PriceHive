import { useState, useEffect, useRef } from 'react';

export const useParallax = (offset = 0.5) => {
    const [scrollY, setScrollY] = useState(0);
    const elementRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            if (elementRef.current) {
                const elementTop = elementRef.current.getBoundingClientRect().top;
                const windowHeight = window.innerHeight;
                
                // Solo calcular parallax cuando el elemento es visible
                if (elementTop < windowHeight && elementTop > -elementTop) {
                    const yPos = (windowHeight - elementTop) * offset;
                    setScrollY(yPos);
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [offset]);

    return { elementRef, scrollY };
};

export const useScrollFade = () => {
    const [opacity, setOpacity] = useState(0);
    const elementRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            if (elementRef.current) {
                const elementTop = elementRef.current.getBoundingClientRect().top;
                const windowHeight = window.innerHeight;
                const elementHeight = elementRef.current.clientHeight;
                
                // Calcular opacidad basada en la posición
                const distance = windowHeight - elementTop;
                const progress = Math.max(0, Math.min(1, distance / (windowHeight * 0.7)));
                
                setOpacity(progress);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Llamar una vez al montar
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return { elementRef, opacity };
};
