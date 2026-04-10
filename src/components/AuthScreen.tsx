import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight } from 'lucide-react';
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
      setError(authType === 'phone' ? 'Enter your phone number' : 'Enter your email');
      return;
    }

    if (authType === 'phone') {
      const phoneClean = trimmed.replace(/[^0-9+]/g, '');
      if (phoneClean.length < 10) {
        setError('Enter a valid 10-digit number');
        return;
      }
      onContinue(phoneClean, 'phone');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) {
        setError('Enter a valid email address');
        return;
      }
      onContinue(trimmed, 'email');
    }
  };

  return (
    <div className="min-h-screen bg-foreground flex flex-col">
      {/* Top section */}
      <motion.div
        className="flex-shrink-0 pt-20 pb-6 px-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo */}
        <motion.div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-10"
          style={{
            background: 'linear-gradient(135deg, hsl(162 63% 41%), hsl(162 63% 50%))',
            boxShadow: '0 12px 40px -10px hsl(162 63% 41% / 0.4)',
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          <span className="text-xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>B</span>
        </motion.div>

        <motion.h1
          className="text-[28px] font-bold text-white leading-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Welcome back
        </motion.h1>
        <motion.p
          className="text-sm mt-2"
          style={{ color: 'hsl(200 15% 55%)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Sign in to manage your spending
        </motion.p>
      </motion.div>

      {/* Form section */}
      <motion.div
        className="flex-1 px-8 flex flex-col"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {/* Toggle */}
        <div className="flex gap-1 p-1 rounded-xl mb-8" style={{ background: 'hsl(200 20% 14%)' }}>
          {(['phone', 'email'] as const).map((type) => (
            <button
              key={type}
              onClick={() => { setAuthType(type); setValue(''); setError(''); }}
              className={cn(
                "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all capitalize",
                authType === type
                  ? "text-white"
                  : "text-white/40 hover:text-white/60"
              )}
              style={authType === type ? {
                background: 'hsl(200 20% 20%)',
              } : {}}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="space-y-2 mb-6">
          <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'hsl(200 15% 50%)' }}>
            {authType === 'phone' ? 'Phone Number' : 'Email Address'}
          </label>
          <div className="relative">
            {authType === 'phone' && (
              <span
                className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium"
                style={{ color: 'hsl(200 15% 50%)' }}
              >
                +91
              </span>
            )}
            <Input
              type={authType === 'phone' ? 'tel' : 'email'}
              inputMode={authType === 'phone' ? 'numeric' : 'email'}
              placeholder={authType === 'phone' ? '9876 543 210' : 'you@example.com'}
              value={value}
              onChange={(e) => { setValue(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && validateAndContinue()}
              className={cn(
                "h-14 text-base rounded-xl border-0 text-white placeholder:text-white/20",
                authType === 'phone' && "pl-14"
              )}
              style={{
                background: 'hsl(200 20% 14%)',
              }}
              autoFocus
            />
          </div>
          {error && (
            <motion.p
              className="text-xs text-destructive pl-1"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.p>
          )}
        </div>

        {/* Continue */}
        <Button
          onClick={validateAndContinue}
          className="w-full h-14 text-base font-semibold rounded-xl gap-2 border-0"
          style={{
            background: 'linear-gradient(135deg, hsl(162 63% 41%), hsl(162 63% 48%))',
            color: 'white',
          }}
          size="lg"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </Button>

        {/* Footer */}
        <p className="text-center text-[11px] mt-auto pb-10" style={{ color: 'hsl(200 15% 35%)' }}>
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </motion.div>
    </div>
  );
};
