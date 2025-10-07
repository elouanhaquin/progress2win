import React, { useEffect, useState } from 'react';

interface ConfettiProps {
  onComplete?: () => void;
}

export const Confetti: React.FC<ConfettiProps> = ({ onComplete }) => {
  const [confettiPieces, setConfettiPieces] = useState<Array<{
    id: number;
    left: number;
    backgroundColor: string;
    animationDelay: number;
    animationDuration: number;
  }>>([]);

  useEffect(() => {
    // Generate random confetti pieces
    const pieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      backgroundColor: [
        '#fbbf24', // yellow
        '#ef4444', // red
        '#3b82f6', // blue
        '#10b981', // green
        '#8b5cf6', // purple
        '#f97316', // orange
      ][Math.floor(Math.random() * 6)],
      animationDelay: Math.random() * 0.5,
      animationDuration: 2 + Math.random() * 1,
    }));

    setConfettiPieces(pieces);

    // Auto-cleanup after animation completes
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 3500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute top-0 w-3 h-3 border-2 border-black shadow-neo-sm animate-confetti-fall"
          style={{
            left: `${piece.left}%`,
            backgroundColor: piece.backgroundColor,
            animationDelay: `${piece.animationDelay}s`,
            animationDuration: `${piece.animationDuration}s`,
          }}
        />
      ))}

      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
          }
        }

        .animate-confetti-fall {
          animation: confetti-fall 3s ease-in forwards;
        }
      `}</style>
    </div>
  );
};
