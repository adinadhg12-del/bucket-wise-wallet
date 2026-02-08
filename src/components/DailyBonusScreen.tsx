import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Gift, Sparkles } from 'lucide-react';

interface DailyBonusScreenProps {
  userId: string;
  onContinue: () => void;
}

const BONUS_AMOUNT = 10;

const COIN_EMOJIS = ['🪙', '💰', '✨', '🪙', '💰', '✨', '🪙', '💰'];

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
      // Skip this screen after a brief moment
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
    setTimeout(onContinue, 2000);
  };

  if (checking || alreadyClaimed) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      {/* Background celebration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {COIN_EMOJIS.map((emoji, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl"
            style={{
              left: `${10 + (i * 12)}%`,
              top: '-10%',
            }}
            animate={{
              y: ['0vh', '110vh'],
              rotate: [0, 360],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              delay: i * 0.3,
              repeat: Infinity,
              ease: 'easeIn',
            }}
          >
            {emoji}
          </motion.div>
        ))}
      </div>

      <motion.div
        className="relative z-10 text-center max-w-sm"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'backOut' }}
      >
        {!claimed ? (
          <>
            {/* Gift icon */}
            <motion.div
              className="w-28 h-28 mx-auto bg-accent/15 rounded-3xl flex items-center justify-center mb-6"
              animate={{
                rotate: [0, -10, 10, -5, 5, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
            >
              <Gift className="w-14 h-14 text-accent" />
            </motion.div>

            <motion.h1
              className="text-2xl font-display font-bold text-foreground mb-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              🎁 Daily Bonus Unlocked!
            </motion.h1>

            <motion.p
              className="text-muted-foreground mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Come back every day to earn more rewards
            </motion.p>

            <motion.div
              className="bg-card rounded-2xl shadow-card p-6 mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium text-muted-foreground">Today's Bonus</span>
                <Sparkles className="w-5 h-5 text-accent" />
              </div>
              <p className="text-4xl font-display font-bold text-primary">
                ₹{BONUS_AMOUNT}
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                onClick={claimBonus}
                className="w-full h-14 text-lg font-semibold rounded-xl gap-2"
                size="lg"
              >
                <Gift className="w-5 h-5" />
                Claim Bonus
              </Button>
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'backOut' }}
            className="text-center"
          >
            <motion.div
              className="text-7xl mb-4"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 0.8 }}
            >
              🎉
            </motion.div>
            <h2 className="text-2xl font-display font-bold text-primary mb-2">Bonus Claimed!</h2>
            <p className="text-muted-foreground">₹{BONUS_AMOUNT} added to your rewards</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
