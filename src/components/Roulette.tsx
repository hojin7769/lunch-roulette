import { useState, useRef } from 'react';
import './Roulette.css';

interface RouletteProps {
    items: string[];
    onSpinEnd: (winner: string) => void;
}

const COLORS = [
    '#ef4444', // red
    '#f97316', // orange
    '#f59e0b', // amber
    '#84cc16', // lime
    '#10b981', // emerald
    '#06b6d4', // cyan
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#d946ef', // fuchsia
    '#f43f5e', // rose
];

export default function Roulette({ items, onSpinEnd }: RouletteProps) {
    const [rotation, setRotation] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const wheelRef = useRef<HTMLDivElement>(null);

    const spin = () => {
        if (isSpinning || items.length === 0) return;

        setIsSpinning(true);
        const newRotation = rotation + 1800 + Math.random() * 360; // Spin at least 5 times
        setRotation(newRotation);

        // Calculate winner
        // The wheel rotates clockwise. The pointer is at the top (0 degrees).
        // The segment at the top is the one that "lands".
        // We need to find which segment is at 0 degrees after rotation.
        // Normalized rotation:
        setTimeout(() => {
            setIsSpinning(false);
            const normalizedRotation = newRotation % 360;
            // If we rotate X degrees clockwise, the item at 0 is now at X.
            // The item that WAS at -X (or 360-X) is now at 0.
            const degreesPerItem = 360 / items.length;

            // The pointer is at the top.
            // 0 degrees is the start of item 0.
            // After rotation R, the angle at the top corresponds to -R (or 360 - R) on the original wheel.
            const effectiveAngle = (360 - normalizedRotation) % 360;

            const winningIndex = Math.floor(effectiveAngle / degreesPerItem);
            onSpinEnd(items[winningIndex]);
        }, 5000); // Match transition duration
    };

    const conicGradient = items.length > 0
        ? items.map((_, i) => {
            const start = (i * 100) / items.length;
            const end = ((i + 1) * 100) / items.length;
            const color = COLORS[i % COLORS.length];
            return `${color} ${start}% ${end}%`;
        }).join(', ')
        : '#334155 0% 100%';

    return (
        <div className="roulette-container">
            <div className="wheel-wrapper">
                <div
                    className="wheel"
                    ref={wheelRef}
                    style={{
                        background: `conic-gradient(${conicGradient})`,
                        transform: `rotate(${rotation}deg)`,
                        transition: isSpinning ? 'transform 5s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none'
                    }}
                >
                    {items.map((item, i) => (
                        <div
                            key={i}
                            className="wheel-label"
                            style={{
                                transform: `rotate(${i * (360 / items.length) + (360 / items.length) / 2}deg)`,
                            }}
                        >
                            <span className="label-text">{item}</span>
                        </div>
                    ))}
                </div>
                <div className="pointer"></div>
                <div className="center-knob"></div>
            </div>
            <button
                className="spin-btn"
                onClick={spin}
                disabled={isSpinning || items.length < 2}
            >
                {isSpinning ? 'Spinning...' : 'SPIN'}
            </button>
        </div>
    );
}
