import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Phone, Mail, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthScreenProps {
  onContinue: (identifier: string, type: 'phone' | 'email') => void;
}

export const AuthScreen = ({ onContinue }: AuthScreenProps) => {
  const [authType, setAuthType] = useState<'phone' | 'email'>('phone');
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const validateAndContinue = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError(authType === 'phone' ? 'Please enter your phone number' : 'Please enter your email');
      return;
    }

    if (authType === 'phone') {
      const phoneClean = trimmed.replace(/[^0-9+]/g, '');
      if (phoneClean.length < 10) {
        setError('Please enter a valid 10-digit phone number');
        return;
      }
      onContinue(phoneClean, 'phone');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) {
        setError('Please enter a valid email address');
        return;
      }
      onContinue(trimmed, 'email');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top section with branding */}
      <motion.div
        className="flex-shrink-0 pt-16 pb-8 px-6 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="text-5xl mb-4"
          animate={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          💰
        </motion.div>
        <h1 className="text-2xl font-display font-bold text-foreground">Budget Buddy</h1>
        <p className="text-muted-foreground text-sm mt-1">Your smart spending companion</p>
      </motion.div>

      {/* Main content */}
      <motion.div
        className="flex-1 px-6 flex flex-col"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="bg-card rounded-2xl shadow-card p-6 space-y-6">
          <div>
            <h2 className="text-lg font-display font-semibold text-foreground">Welcome!</h2>
            <p className="text-sm text-muted-foreground mt-1">Sign in to continue managing your budget</p>
          </div>

          {/* Auth type toggle */}
          <div className="flex bg-muted rounded-xl p-1 gap-1">
            <button
              onClick={() => { setAuthType('phone'); setValue(''); setError(''); }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all",
                authType === 'phone'
                  ? "bg-card text-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Phone className="w-4 h-4" />
              Phone
            </button>
            <button
              onClick={() => { setAuthType('email'); setValue(''); setError(''); }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all",
                authType === 'email'
                  ? "bg-card text-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
          </div>

          {/* Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {authType === 'phone' ? 'Phone Number' : 'Email Address'}
            </label>
            <div className="relative">
              {authType === 'phone' && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                  +91
                </span>
              )}
              <Input
                type={authType === 'phone' ? 'tel' : 'email'}
                inputMode={authType === 'phone' ? 'numeric' : 'email'}
                placeholder={authType === 'phone' ? '9876543210' : 'you@example.com'}
                value={value}
                onChange={(e) => { setValue(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && validateAndContinue()}
                className={cn(
                  "h-14 text-lg rounded-xl",
                  authType === 'phone' && "pl-12"
                )}
                autoFocus
              />
            </div>
            {error && (
              <motion.p
                className="text-sm text-destructive"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.p>
            )}
          </div>

          {/* Continue button */}
          <Button
            onClick={validateAndContinue}
            className="w-full h-14 text-base font-semibold rounded-xl gap-2"
            size="lg"
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6 pb-8">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
};
