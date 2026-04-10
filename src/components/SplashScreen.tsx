import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 600),
      setTimeout(() => setPhase(2), 1600),
      setTimeout(onComplete, 2800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-foreground"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Subtle gradient orb */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(162 63% 41% / 0.15) 0%, transparent 70%)',
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: phase >= 1 ? 1.2 : 0, opacity: phase >= 1 ? 1 : 0 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      />

      <div className="relative flex flex-col items-center">
        {/* Logo mark — clean geometric shape */}
        <motion.div
          className="relative"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="w-20 h-20 rounded-[22px] flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, hsl(162 63% 41%), hsl(162 63% 50%))',
              boxShadow: '0 20px 60px -15px hsl(162 63% 41% / 0.5)',
            }}
            animate={phase >= 2 ? { scale: [1, 0.95, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <motion.span
              className="text-3xl font-bold text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              B
            </motion.span>
          </motion.div>
        </motion.div>

        {/* Brand name */}
        <motion.h1
          className="mt-8 text-3xl font-bold tracking-tight text-white"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          initial={{ opacity: 0, y: 16 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          Budget Buddy
        </motion.h1>

        <motion.p
          className="mt-2 text-sm tracking-widest uppercase"
          style={{ color: 'hsl(200 15% 55%)' }}
          initial={{ opacity: 0 }}
          animate={phase >= 1 ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          Smart Finance
        </motion.p>

        {/* Minimal loading indicator */}
        <motion.div
          className="mt-12 w-8 h-0.5 rounded-full overflow-hidden"
          style={{ background: 'hsl(200 15% 25%)' }}
          initial={{ opacity: 0 }}
          animate={phase >= 1 ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'hsl(162 63% 41%)' }}
            initial={{ width: '0%' }}
            animate={phase >= 1 ? { width: '100%' } : {}}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};
