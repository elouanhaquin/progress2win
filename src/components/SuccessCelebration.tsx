import React from 'react';
import { Trophy, TrendingUp, Zap } from 'lucide-react';
import { Confetti } from './Confetti';

interface SuccessCelebrationProps {
  message?: string;
  onComplete?: () => void;
}

const encouragingMessages = [
  "Beast mode activated! 💪",
  "You're crushing it! 🔥",
  "Another W! Keep going! 🚀",
  "Unstoppable! 💯",
  "That's how it's done! ⚡",
  "Progress = Success! 🎯",
  "You're on fire! 🔥",
  "Absolute legend! 👑",
  "Killing it! 💪",
  "Let's gooo! 🚀",
];

export const SuccessCelebration: React.FC<SuccessCelebrationProps> = ({
  message,
  onComplete
}) => {
  const randomMessage = message || encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black bg-opacity-50 pointer-events-none">
      <Confetti onComplete={onComplete} />

      <div className="animate-bounce-in pointer-events-none">
        <div className="bg-accent-500 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Trophy className="w-12 h-12 text-black animate-wiggle" />
            <TrendingUp className="w-12 h-12 text-black animate-wiggle" style={{ animationDelay: '0.1s' }} />
            <Zap className="w-12 h-12 text-black animate-wiggle" style={{ animationDelay: '0.2s' }} />
          </div>

          <h2 className="text-4xl font-black text-black mb-2">
            {randomMessage}
          </h2>

          <p className="text-lg font-bold text-black">
            Progress logged successfully!
          </p>
        </div>
      </div>

      <style>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0) rotate(-10deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.1) rotate(5deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes wiggle {
          0%, 100% {
            transform: rotate(-10deg);
          }
          50% {
            transform: rotate(10deg);
          }
        }

        .animate-bounce-in {
          animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }

        .animate-wiggle {
          animation: wiggle 0.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
