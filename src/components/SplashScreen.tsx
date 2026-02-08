import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

const SYMBOLS = ['₹', '💰', '🪙', '💵', '💸', '₹', '🪙', '₹', '💰', '💵', '₹', '💸', '🪙', '₹', '💰', '₹'];

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 900),
      setTimeout(() => setPhase(2), 1800),
      setTimeout(() => setPhase(3), 2800),
      setTimeout(onComplete, 3600),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const moneyItems = useMemo(() =>
    SYMBOLS.map((symbol, i) => ({
      id: i,
      symbol,
      x: (Math.random() - 0.5) * 350,
      y: (Math.random() - 0.5) * 700,
      rotate: Math.random() * 720 - 360,
      scale: 0.6 + Math.random() * 0.8,
      delay: Math.random() * 0.2,
    })),
    []
  );

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, hsl(162 63% 35%), hsl(162 63% 45%), hsl(170 55% 40%))',
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Subtle background particles */}
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={`bg-${i}`}
            className="absolute rounded-full"
            style={{
              width: 100 + i * 40,
              height: 100 + i * 40,
              left: `${15 + i * 15}%`,
              top: `${10 + i * 12}%`,
              background: 'radial-gradient(circle, white 0%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              delay: i * 0.3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Phase 0 & 1: Money symbols floating and being attracted */}
      <AnimatePresence>
        {phase < 3 && moneyItems.map(item => (
          <motion.span
            key={item.id}
            className="absolute select-none pointer-events-none"
            style={{ fontSize: `${1.5 + item.scale * 0.8}rem` }}
            initial={{
              x: item.x,
              y: item.y,
              rotate: item.rotate,
              scale: 0,
              opacity: 0,
            }}
            animate={
              phase === 0
                ? {
                    x: item.x,
                    y: item.y,
                    rotate: item.rotate,
                    scale: item.scale,
                    opacity: 0.85,
                  }
                : phase === 1
                ? {
                    x: item.x * 0.15,
                    y: item.y * 0.15,
                    rotate: 0,
                    scale: item.scale * 0.4,
                    opacity: 0.6,
                  }
                : {
                    x: 0,
                    y: 0,
                    rotate: 0,
                    scale: 0,
                    opacity: 0,
                  }
            }
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              duration: phase === 0 ? 0.7 : 0.9,
              delay: item.delay,
              ease: phase === 0 ? 'backOut' : [0.25, 0.8, 0.25, 1],
            }}
          >
            {item.symbol}
          </motion.span>
        ))}
      </AnimatePresence>

      {/* Phase 1: Magnet */}
      <AnimatePresence>
        {phase === 1 && (
          <motion.div
            className="absolute text-5xl z-10"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: [0, 1.3, 1.1], rotate: 0 }}
            exit={{ scale: 0, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.6, ease: 'backOut' }}
          >
            🧲
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 2-3: Brand reveal */}
      <AnimatePresence>
        {phase >= 2 && (
          <motion.div
            className="text-center z-10 px-4"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="text-6xl mb-4"
              animate={{ rotate: [0, -15, 15, -5, 0] }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              💰
            </motion.div>

            <motion.h1
              className="text-4xl font-display font-bold tracking-tight"
              style={{ color: 'white' }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              Budget Buddy
            </motion.h1>

            <motion.p
              className="mt-3 text-sm tracking-wide"
              style={{ color: 'rgba(255,255,255,0.65)' }}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Smart spending, simple life
            </motion.p>

            {/* Loading dots */}
            <motion.div
              className="flex justify-center gap-1.5 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.5)' }}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.15,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
