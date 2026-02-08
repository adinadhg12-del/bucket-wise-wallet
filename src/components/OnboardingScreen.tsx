import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BucketType, BUCKET_CONFIG } from '@/types/bucket';
import { cn } from '@/lib/utils';
import { ArrowRight, Sparkles } from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: (budgets: Record<BucketType, number>) => void;
}

const DEFAULT_BUDGETS: Record<BucketType, number> = {
  food: 5000,
  rent: 15000,
  transport: 3000,
  movies: 2000,
  others: 5000,
};

const bucketColorClass: Record<BucketType, string> = {
  food: 'bg-bucket-food',
  rent: 'bg-bucket-rent',
  transport: 'bg-bucket-transport',
  movies: 'bg-bucket-movies',
  others: 'bg-bucket-others',
};

export const OnboardingScreen = ({ onComplete }: OnboardingScreenProps) => {
  const [budgets, setBudgets] = useState<Record<BucketType, number>>({ ...DEFAULT_BUDGETS });

  const updateBudget = (type: BucketType, value: string) => {
    const sanitized = value.replace(/[^0-9]/g, '');
    setBudgets(prev => ({ ...prev, [type]: parseInt(sanitized) || 0 }));
  };

  const totalBudget = Object.values(budgets).reduce((sum, b) => sum + b, 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <motion.div
        className="px-6 pt-10 pb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">Getting Started</span>
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground">Set Your Monthly Budget</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Decide how much you want to spend in each category. You can always change this later.
        </p>
      </motion.div>

      {/* Bucket list */}
      <div className="flex-1 px-6 space-y-3 overflow-auto pb-4">
        {(Object.entries(BUCKET_CONFIG) as [BucketType, { name: string; icon: string }][]).map(
          ([type, config], index) => (
            <motion.div
              key={type}
              className="bg-card rounded-xl shadow-soft p-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow-soft",
                    bucketColorClass[type]
                  )}
                  style={{ color: 'white' }}
                >
                  {config.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-foreground text-sm">
                    {config.name}
                  </h3>
                </div>
              </div>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  ₹
                </span>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={budgets[type].toString()}
                  onChange={(e) => updateBudget(type, e.target.value)}
                  className="pl-7 h-11 text-lg font-display rounded-xl"
                />
              </div>

              {/* Quick presets */}
              <div className="flex gap-1.5 mt-2">
                {[2000, 5000, 10000, 20000].map(preset => (
                  <button
                    key={preset}
                    onClick={() => setBudgets(prev => ({ ...prev, [type]: preset }))}
                    className={cn(
                      "flex-1 text-xs py-1.5 rounded-lg transition-colors font-medium",
                      budgets[type] === preset
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    ₹{(preset / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </motion.div>
          )
        )}
      </div>

      {/* Footer */}
      <motion.div
        className="px-6 pb-8 pt-4 bg-background border-t border-border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-muted-foreground">Total Monthly Budget</span>
          <span className="text-lg font-display font-bold text-foreground">
            ₹{totalBudget.toLocaleString('en-IN')}
          </span>
        </div>

        <Button
          onClick={() => onComplete(budgets)}
          className="w-full h-14 text-base font-semibold rounded-xl gap-2"
          size="lg"
        >
          Get Started
          <ArrowRight className="w-5 h-5" />
        </Button>
      </motion.div>
    </div>
  );
};
