import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// ==========================================
// CONFIGURACIÓN GLOBAL PARAMETRIZADA
// ==========================================
const BEE_APPEARANCE_RATIO = 1.0;
const BEE_INTERVAL = 10000;

// Parámetros de vuelo de la abeja
const BEE_FLIGHT_DURATION = 3000; // Tiempo en milisegundos que tarda en cruzar (ej. 6000 = 6 segundos)
const LOOP_CHANCE = 0.9; // Probabilidad de hacer un círculo (0.0 = nunca, 1.0 = siempre, 0.5 = 50%)

const MESSAGES = [
    "¡Bzzzt! ¿Buscando chollos? 🐝",
    "¡Hoy hay miel de la buena! 🍯",
    "¿Has visto ese ofertón? ✨",
    "Trabajando duro para tu bolsillo 👷‍♂️",
    "¡Ahorrar es mi pasión! ❤️"
];

const POSITIONS = [
    { bottom: '4rem', right: '-0.5rem', side: 'right' }, // Sale por la derecha, vuela hacia la izquierda
    { bottom: '4rem', left: '-0.5rem', side: 'left' },   // Sale por la izquierda, vuela hacia la derecha
    { top: '8rem', right: '-0.5rem', side: 'right' },
    { top: '8rem', left: '-0.5rem', side: 'left' },
];

const styleSheet = `
    @keyframes horizontal-fly-left {
        from { transform: translateX(0); }
        to { transform: translateX(-150vw); }
    }
    @keyframes horizontal-fly-right {
        from { transform: translateX(0); }
        to { transform: translateX(150vw); }
    }
    @keyframes vertical-sine {
        0%, 100% { transform: translateY(0); }
        25% { transform: translateY(-70px); }
        75% { transform: translateY(70px); }
    }
    /* Animación para el rizo cuando vuela hacia la izquierda */
    @keyframes loop-maneuver-left {
        0%, 35% { transform: rotate(0deg) translateY(0) translateX(0); }
        45% { transform: rotate(-180deg) translateY(-120px) translateX(100px); }
        55% { transform: rotate(-360deg) translateY(0) translateX(0); }
        100% { transform: rotate(-360deg) translateY(0) translateX(0); }
    }
    /* Animación para el rizo cuando vuela hacia la derecha */
    @keyframes loop-maneuver-right {
        0%, 35% { transform: rotate(0deg) translateY(0) translateX(0); }
        45% { transform: rotate(180deg) translateY(-120px) translateX(-100px); }
        55% { transform: rotate(360deg) translateY(0) translateX(0); }
        100% { transform: rotate(360deg) translateY(0) translateX(0); }
    }
`;

export const HoneyRain = () => {
    const bees = Array.from({ length: 20 });
    return (
        <div className="fixed inset-0 z-[200] pointer-events-none overflow-hidden">
            {bees.map((_, i) => (
                <img
                    key={i}
                    src="/icon.png"
                    alt=""
                    className="absolute w-8 h-8 opacity-60 animate-fall"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: '-10%',
                        animationDelay: `${Math.random() * 5}s`,
                        animationDuration: `${3 + Math.random() * 2}s`
                    }}
                />
            ))}
        </div>
    );
};

export const BeeEasterEgg = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isFlying, setIsFlying] = useState(false);
    const [doesLoop, setDoesLoop] = useState(false); // Estado para saber si hará un círculo
    const [message, setMessage] = useState("");
    const [position, setPosition] = useState(POSITIONS[0]);
    const [side, setSide] = useState('right');
    const [particles, setParticles] = useState([]);
    const beeRef = useRef(null);
    const location = useLocation();

    useEffect(() => {
        const rollForBee = () => {
            setIsVisible(currentVisible => {
                if (!currentVisible) {
                    if (Math.random() < BEE_APPEARANCE_RATIO) {
                        const randomPos = POSITIONS[Math.floor(Math.random() * POSITIONS.length)];
                        setPosition(randomPos);
                        setSide(randomPos.side);
                        setMessage(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
                        return true;
                    }
                }
                return currentVisible;
            });
        };

        setIsFlying(false);
        setIsVisible(true);
        const startPos = POSITIONS[Math.floor(Math.random() * POSITIONS.length)];
        setPosition(startPos);
        setSide(startPos.side);
        setMessage(MESSAGES[Math.floor(MESSAGES.length * Math.random())]);

        const interval = setInterval(rollForBee, BEE_INTERVAL);
        return () => clearInterval(interval);
    }, [location.pathname]);

    useEffect(() => {
        let interval;
        if (isFlying) {
            interval = setInterval(() => {
                if (beeRef.current) {
                    const rect = beeRef.current.getBoundingClientRect();
                    const newParticle = {
                        id: Math.random(),
                        x: rect.left + rect.width / 2,
                        y: rect.top + rect.height / 2,
                    };
                    setParticles(prev => [...prev.slice(-25), newParticle]);
                }
            }, 80);
        } else {
            setParticles([]);
        }
        return () => clearInterval(interval);
    }, [isFlying]);

    const handleBeeClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Decidimos aleatoriamente si en este vuelo hará un círculo o no
        setDoesLoop(Math.random() < LOOP_CHANCE);
        setIsFlying(true);

        // El tiempo en el setTimeout ahora viene de nuestro parámetro global
        setTimeout(() => {
            setIsFlying(false);
            setIsVisible(false);
        }, BEE_FLIGHT_DURATION);
    };

    if (!isVisible) return null;

    return (
        <>
            <style>{styleSheet}</style>

            {/* Contenedor 1: Movimiento Horizontal y tiempo total del vuelo */}
            <div
                className="fixed z-[9999] pointer-events-none sm:pointer-events-auto"
                style={{
                    top: position.top,
                    bottom: position.bottom,
                    left: position.left,
                    right: position.right,
                    animation: isFlying
                        ? `${side === 'right' ? 'horizontal-fly-left' : 'horizontal-fly-right'} ${BEE_FLIGHT_DURATION}ms linear forwards`
                        : 'none'
                }}
            >
                {/* Contenedor 2: Ondulación tipo Seno */}
                <div style={{ animation: isFlying ? 'vertical-sine 0.7s infinite ease-in-out' : 'none' }}>

                    {/* Contenedor 3: Rotación/Círculo (si ha tocado hacerlo) */}
                    <div style={{
                        animation: (isFlying && doesLoop)
                            ? `${side === 'right' ? 'loop-maneuver-left' : 'loop-maneuver-right'} ${BEE_FLIGHT_DURATION}ms ease-in-out forwards`
                            : 'none'
                    }}>

                        <div className="relative group">
                            <img
                                ref={beeRef}
                                src="/icon.png"
                                alt="PriceHive Bee"
                                onClick={handleBeeClick}
                                className={`w-14 h-14 object-contain opacity-60 hover:opacity-100 transition-all duration-500 ${isFlying ? `scale-125 ${side === 'left' ? 'scale-x-[-1]' : ''}` : `-rotate-12 hover:rotate-0 ${side === 'left' ? 'scale-x-[-1]' : ''} animate-bounce-subtle`} cursor-pointer drop-shadow-lg`}
                            />
                            {!isFlying && (
                                <div className={`absolute bottom-full mb-2 px-3 py-1.5 bg-secondary text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl ${side === 'right' ? 'right-0' : 'left-0'}`}>
                                    {message}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            {/* Partículas */}
            {particles.map((p, i) => (
                <div
                    key={p.id}
                    className="fixed pointer-events-none z-[9998] w-2 h-2 bg-primary rounded-full blur-[1px] animate-fade-out"
                    style={{
                        left: p.x,
                        top: p.y,
                        opacity: (i + 1) / particles.length * 0.8
                    }}
                />
            ))}
        </>
    );
};