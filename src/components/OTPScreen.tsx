import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OTPScreenProps {
  identifier: string;
  type: 'phone' | 'email';
  onVerify: (otp: string) => Promise<{ error: string | null }>;
  onBack: () => void;
}

export const OTPScreen = ({ identifier, type, onVerify, onBack }: OTPScreenProps) => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    const code = otp.join('');
    if (code.length === 6 && !loading) {
      handleVerify(code);
    }
  }, [otp]);

  const handleVerify = async (code: string) => {
    setLoading(true);
    setError('');
    const result = await onVerify(code);
    if (result.error) {
      setError(result.error);
      setOtp(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    }
    setLoading(false);
  };

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/[^0-9]/g, '').split('').slice(0, 6);
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (index + i < 6) newOtp[index + i] = d;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const digit = value.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    const newOtp = Array(6).fill('');
    pasted.split('').forEach((d, i) => { newOtp[i] = d; });
    setOtp(newOtp);
    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const maskedIdentifier = type === 'phone'
    ? `+91 ${identifier.slice(-10, -4)}****${identifier.slice(-2)}`
    : `${identifier.slice(0, 3)}***@${identifier.split('@')[1]}`;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'hsl(200 25% 8%)' }}>
      {/* Header */}
      <motion.div
        className="flex items-center gap-3 px-4 pt-6"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full text-white/60 hover:text-white hover:bg-white/5"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </motion.div>

      <motion.div
        className="flex-1 px-8 pt-12 flex flex-col"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        {/* Title section */}
        <div className="mb-10">
          <h2
            className="text-[28px] font-bold text-white leading-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Verify your {type === 'phone' ? 'number' : 'email'}
          </h2>
          <p className="text-sm mt-3" style={{ color: 'hsl(200 15% 50%)' }}>
            Enter the 6-digit code sent to{' '}
            <span className="text-white/80">{maskedIdentifier}</span>
          </p>
        </div>

        {/* OTP Input */}
        <div className="flex justify-between gap-2 mb-4" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <motion.input
              key={index}
              ref={el => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(index, e.target.value)}
              onKeyDown={e => handleKeyDown(index, e)}
              className={cn(
                "w-full aspect-square max-w-[52px] text-center text-xl font-bold rounded-xl border-2 transition-all outline-none text-white",
                digit
                  ? "border-primary"
                  : "border-white/10",
                "focus:border-primary focus:ring-1 focus:ring-primary/30"
              )}
              style={{
                background: 'hsl(200 20% 12%)',
                fontFamily: "'Space Grotesk', sans-serif",
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.04 }}
              autoFocus={index === 0}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <motion.p
            className="text-xs text-destructive mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.p>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          </div>
        )}

        {/* Resend */}
        <div className="mt-6 space-y-2">
          {resendTimer > 0 ? (
            <p className="text-sm" style={{ color: 'hsl(200 15% 45%)' }}>
              Resend in <span className="text-white/70">{resendTimer}s</span>
            </p>
          ) : (
            <button
              className="text-sm font-medium text-primary"
              onClick={() => setResendTimer(30)}
            >
              Resend code
            </button>
          )}
          <button
            className="block text-xs"
            style={{ color: 'hsl(200 15% 40%)' }}
            onClick={onBack}
          >
            Change {type === 'phone' ? 'number' : 'email'}
          </button>
        </div>

        {/* Dev hint */}
        <motion.div
          className="mt-auto mb-8 rounded-xl px-4 py-3"
          style={{ background: 'hsl(162 63% 41% / 0.08)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-xs font-medium" style={{ color: 'hsl(162 63% 55%)' }}>
            Prototype — enter any 6 digits
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};
