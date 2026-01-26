import { useState } from 'react';
import { Bucket, BucketType } from '@/types/bucket';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, XCircle, Smartphone } from 'lucide-react';

interface PaymentModalProps {
  bucket: Bucket | null;
  isOpen: boolean;
  onClose: () => void;
  canAfford: (id: BucketType, amount: number) => boolean;
  onPaymentComplete: (bucketId: BucketType, amount: number, status: 'success' | 'failed') => void;
}

type PaymentStep = 'input' | 'confirm' | 'processing' | 'result';

export const PaymentModal = ({
  bucket,
  isOpen,
  onClose,
  canAfford,
  onPaymentComplete,
}: PaymentModalProps) => {
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<PaymentStep>('input');
  const [error, setError] = useState('');
  const [paymentResult, setPaymentResult] = useState<'success' | 'failed' | null>(null);

  const balance = bucket ? bucket.budget - bucket.spent : 0;
  const numericAmount = parseFloat(amount) || 0;
  const canPay = numericAmount > 0 && bucket && canAfford(bucket.id, numericAmount);

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimal point
    const sanitized = value.replace(/[^0-9.]/g, '');
    setAmount(sanitized);
    setError('');
  };

  const handleProceed = () => {
    if (!bucket) return;

    if (numericAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!canAfford(bucket.id, numericAmount)) {
      setError(`Insufficient balance! You only have ₹${balance.toLocaleString('en-IN')} in ${bucket.name}`);
      return;
    }

    setStep('confirm');
  };

  const initiateUPIPayment = () => {
    if (!bucket) return;

    setStep('processing');

    // Create UPI deep link
    // This opens UPI apps on Android/iOS browsers
    const upiUrl = `upi://pay?pa=test@upi&pn=BucketPay&am=${numericAmount}&cu=INR&tn=${bucket.name} payment`;
    
    // Try to open UPI app
    window.location.href = upiUrl;

    // After a delay, show result buttons (since we can't detect UPI result automatically)
    setTimeout(() => {
      setStep('result');
    }, 2000);
  };

  const handlePaymentResult = (status: 'success' | 'failed') => {
    if (!bucket) return;
    setPaymentResult(status);
    onPaymentComplete(bucket.id, numericAmount, status);
    
    // Close after showing result
    setTimeout(() => {
      handleClose();
    }, 1500);
  };

  const handleClose = () => {
    setAmount('');
    setStep('input');
    setError('');
    setPaymentResult(null);
    onClose();
  };

  if (!bucket) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md mx-4 rounded-xl">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <span className="text-2xl">{bucket.icon}</span>
            Pay from {bucket.name}
          </DialogTitle>
          <DialogDescription>
            Available balance: ₹{balance.toLocaleString('en-IN')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {step === 'input' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Enter Amount (₹)
                </label>
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="text-2xl font-display h-14 text-center"
                  autoFocus
                />
                {error && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                {[100, 500, 1000].map((preset) => (
                  <Button
                    key={preset}
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(preset.toString())}
                    className="flex-1"
                  >
                    ₹{preset}
                  </Button>
                ))}
              </div>

              <Button
                onClick={handleProceed}
                disabled={!canPay}
                className="w-full h-12 text-lg font-semibold"
              >
                Proceed to Pay
              </Button>
            </>
          )}

          {step === 'confirm' && (
            <div className="text-center space-y-4">
              <div className="bg-muted rounded-xl p-6">
                <p className="text-sm text-muted-foreground mb-1">You're paying</p>
                <p className="text-4xl font-display font-bold text-foreground">
                  ₹{numericAmount.toLocaleString('en-IN')}
                </p>
                <p className="text-sm text-muted-foreground mt-2">from {bucket.name} bucket</p>
              </div>

              <Button
                onClick={initiateUPIPayment}
                className="w-full h-14 text-lg font-semibold gap-2"
              >
                <Smartphone className="w-5 h-5" />
                Pay with UPI
              </Button>

              <Button variant="ghost" onClick={() => setStep('input')} className="w-full">
                Go Back
              </Button>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center space-y-4 py-8">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center animate-pulse-soft">
                <Smartphone className="w-8 h-8 text-primary" />
              </div>
              <p className="text-lg font-medium">Opening UPI app...</p>
              <p className="text-sm text-muted-foreground">
                Complete the payment in your UPI app
              </p>
            </div>
          )}

          {step === 'result' && paymentResult === null && (
            <div className="text-center space-y-4">
              <p className="text-lg font-medium">Was the payment successful?</p>
              <p className="text-sm text-muted-foreground">
                Please confirm the result after completing payment in your UPI app
              </p>

              <div className="flex gap-3">
                <Button
                  onClick={() => handlePaymentResult('success')}
                  className="flex-1 h-12 bg-success hover:bg-success/90"
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Yes, Success
                </Button>
                <Button
                  onClick={() => handlePaymentResult('failed')}
                  variant="outline"
                  className="flex-1 h-12 border-destructive text-destructive hover:bg-destructive/10"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  No, Failed
                </Button>
              </div>
            </div>
          )}

          {paymentResult && (
            <div
              className={cn(
                "text-center py-8 animate-scale-in",
                paymentResult === 'success' ? "text-success" : "text-destructive"
              )}
            >
              {paymentResult === 'success' ? (
                <>
                  <CheckCircle2 className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-xl font-display font-semibold">Payment Recorded!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    ₹{numericAmount.toLocaleString('en-IN')} deducted from {bucket.name}
                  </p>
                </>
              ) : (
                <>
                  <XCircle className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-xl font-display font-semibold">Payment Failed</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    No amount was deducted
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
