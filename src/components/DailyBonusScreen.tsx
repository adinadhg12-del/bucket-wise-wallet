import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface DailyBonusScreenProps {
  userId: string;
  onContinue: () => void;
}

const BONUS_AMOUNT = 10;

export const DailyBonusScreen = ({ userId, onContinue }: DailyBonusScreenProps) => {
  const [checking, setChecking] = useState(true);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    checkBonus();
  }, [userId]);

  const checkBonus = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await (supabase as any)
      .from('daily_bonuses')
      .select('id')
      .eq('user_id', userId)
      .eq('claimed_date', today)
      .maybeSingle();

    if (data) {
      setAlreadyClaimed(true);
      setTimeout(onContinue, 300);
    }
    setChecking(false);
  };

  const claimBonus = async () => {
    const today = new Date().toISOString().split('T')[0];
    await (supabase as any)
      .from('daily_bonuses')
      .insert({ user_id: userId, claimed_date: today, bonus_amount: BONUS_AMOUNT });

    setClaimed(true);
    setTimeout(onContinue, 2200);
  };

  if (checking || alreadyClaimed) return null;

  return (
    <motion.div
      className="min-h-screen bg-foreground flex flex-col items-center justify-center px-6 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Subtle gradient orb */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(162 63% 41% / 0.12) 0%, transparent 70%)',
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1.2, opacity: 1 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      />

      <AnimatePresence mode="wait">
        {!claimed ? (
          <motion.div
            key="claim"
            className="relative z-10 text-center max-w-xs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Icon */}
            <motion.div
              className="w-20 h-20 mx-auto rounded-[22px] flex items-center justify-center mb-8"
              style={{
                background: 'linear-gradient(135deg, hsl(162 63% 41%), hsl(162 63% 50%))',
                boxShadow: '0 20px 60px -15px hsl(162 63% 41% / 0.5)',
              }}
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            >
              <span className="text-3xl">🎁</span>
            </motion.div>

            <motion.h1
              className="text-2xl font-bold text-white mb-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
            >
              Daily Bonus
            </motion.h1>

            <motion.p
              className="text-sm mb-10"
              style={{ color: 'hsl(200 15% 55%)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              Come back every day to earn rewards
            </motion.p>

            {/* Amount card */}
            <motion.div
              className="rounded-2xl p-6 mb-8"
              style={{
                background: 'hsl(200 15% 12%)',
                border: '1px solid hsl(200 15% 18%)',
              }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <p
                className="text-xs tracking-widest uppercase mb-3"
                style={{ color: 'hsl(162 63% 41%)' }}
              >
                Today's Reward
              </p>
              <p
                className="text-4xl font-bold text-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                ₹{BONUS_AMOUNT}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                onClick={claimBonus}
                className="w-full h-14 text-base font-semibold rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, hsl(162 63% 41%), hsl(162 63% 50%))',
                  color: 'white',
                  boxShadow: '0 8px 32px -8px hsl(162 63% 41% / 0.5)',
                }}
                size="lg"
              >
                Claim Bonus
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="claimed"
            className="relative z-10 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6"
              style={{
                background: 'hsl(162 63% 41% / 0.15)',
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, ease: 'backOut' }}
            >
              <motion.span
                className="text-4xl"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3, ease: 'backOut' }}
              >
                ✓
              </motion.span>
            </motion.div>

            <h2
              className="text-2xl font-bold text-white mb-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Bonus Claimed
            </h2>
            <p style={{ color: 'hsl(200 15% 55%)' }}>
              ₹{BONUS_AMOUNT} added to your rewards
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
