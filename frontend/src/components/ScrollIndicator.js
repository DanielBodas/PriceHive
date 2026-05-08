import { useEffect, useState } from 'react';

export const ScrollIndicator = () => {
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrolled = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            setScrollProgress(scrolled);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-slate-100">
            <div 
                className="h-full bg-primary transition-all duration-300 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                style={{ width: `${scrollProgress}%` }}
            ></div>
        </div>
    );
};

export default ScrollIndicator;
