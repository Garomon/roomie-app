"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Fingerprint, Check } from "lucide-react";
import confetti from "canvas-confetti";

interface BiometricCommitmentProps {
    onCommit: () => void;
}

export default function BiometricCommitment({ onCommit }: BiometricCommitmentProps) {
    const [isHolding, setIsHolding] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const startHolding = () => {
        if (isComplete) return;
        setIsHolding(true);
        // Haptic feedback start
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(50);
        }

        let currentProgress = 0;
        intervalRef.current = setInterval(() => {
            currentProgress += 4; // 25 ticks = 100% (approx 750ms hold time for snappier feel)
            setProgress(currentProgress);

            if (currentProgress >= 100) {
                completeCommitment();
            }
        }, 30);
    };

    const stopHolding = () => {
        if (isComplete) return;
        setIsHolding(false);
        setProgress(0);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const completeCommitment = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsComplete(true);
        setIsHolding(false);

        // Success Haptics
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }

        // Confetti
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#06B6D4', '#10B981', '#A855F7']
        });

        // Callback
        setTimeout(onCommit, 1500);
    };

    return (
        <div className="flex flex-col items-center justify-center gap-6 select-none">
            <div className="relative w-32 h-32 flex items-center justify-center">
                {/* Progress Ring */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none">
                    <circle
                        cx="64"
                        cy="64"
                        r="58"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        className="text-gray-800"
                    />
                    <motion.circle
                        cx="64"
                        cy="64"
                        r="58"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        className="text-cyan-500"
                        strokeDasharray="364"
                        strokeDashoffset={364 - (364 * progress) / 100}
                        strokeLinecap="round"
                    />
                </svg>

                {/* Fingerprint Button */}
                <motion.button
                    className={`relative z-10 flex items-center justify-center w-24 h-24 rounded-full 
                        ${isComplete ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/10 text-cyan-400'}
                        border-2 ${isComplete ? 'border-emerald-500' : isHolding ? 'border-cyan-400' : 'border-cyan-500/30'}
                        transition-colors duration-300 outline-none`}
                    onMouseDown={startHolding}
                    onMouseUp={stopHolding}
                    onMouseLeave={stopHolding}
                    onTouchStart={(e) => { e.preventDefault(); startHolding(); }}
                    onTouchEnd={(e) => { e.preventDefault(); stopHolding(); }}
                    whileTap={{ scale: 0.95 }}
                >
                    {isComplete ? (
                        <Check className="w-12 h-12" />
                    ) : (
                        <Fingerprint className={`w-12 h-12 ${isHolding ? 'animate-pulse' : ''}`} />
                    )}
                </motion.button>
            </div>

            <div className="text-center space-y-2">
                <h3 className={`text-xl font-bold ${isComplete ? 'text-emerald-400' : 'text-white'}`}>
                    {isComplete ? "Compromiso Sellado" : "Sellar Compromiso"}
                </h3>
                <p className="text-sm text-gray-400 max-w-xs mx-auto">
                    {isComplete
                        ? "Bienvenido a la tribu."
                        : "Mantén presionado el sensor para aceptar el Manifiesto y unirte a Vibra Alta."}
                </p>
            </div>
        </div>
    );
}
