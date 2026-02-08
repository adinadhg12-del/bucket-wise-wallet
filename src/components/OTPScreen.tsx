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

  // Resend timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Auto-verify when 6 digits entered
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
      // Handle paste
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <motion.div
        className="flex items-center gap-3 px-4 pt-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="font-display font-semibold text-foreground">Verify OTP</h2>
      </motion.div>

      <motion.div
        className="flex-1 px-6 pt-8 flex flex-col"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Info */}
        <div className="text-center mb-8">
          <motion.div
            className="w-20 h-20 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center text-4xl mb-4"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🔐
          </motion.div>
          <h3 className="text-lg font-display font-semibold text-foreground">Enter verification code</h3>
          <p className="text-sm text-muted-foreground mt-2">
            We sent a 6-digit code to<br />
            <span className="font-medium text-foreground">{maskedIdentifier}</span>
          </p>
        </div>

        {/* OTP Input */}
        <div className="flex justify-center gap-2.5 mb-4" onPaste={handlePaste}>
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
                "w-12 h-14 text-center text-xl font-display font-bold rounded-xl border-2 bg-card transition-all outline-none",
                digit
                  ? "border-primary text-foreground"
                  : "border-border text-foreground",
                "focus:border-primary focus:ring-2 focus:ring-primary/20"
              )}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              autoFocus={index === 0}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <motion.p
            className="text-center text-sm text-destructive mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.p>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        )}

        {/* Resend / Change */}
        <div className="text-center space-y-3 mt-4">
          {resendTimer > 0 ? (
            <p className="text-sm text-muted-foreground">
              Resend code in <span className="font-medium text-foreground">{resendTimer}s</span>
            </p>
          ) : (
            <Button
              variant="ghost"
              className="text-primary font-medium"
              onClick={() => setResendTimer(30)}
            >
              Resend OTP
            </Button>
          )}

          <Button
            variant="link"
            className="text-muted-foreground text-sm"
            onClick={onBack}
          >
            Change {type === 'phone' ? 'phone number' : 'email'}
          </Button>
        </div>

        {/* Hint for prototype */}
        <motion.div
          className="mt-auto mb-8 bg-accent/10 rounded-xl p-3 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-xs text-accent font-medium">
            🧪 Prototype mode: Enter any 6 digits to verify
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};
