import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Camera, Check, X, ScanLine, IndianRupee, User, AlertTriangle } from 'lucide-react';
import { BucketType, BUCKET_CONFIG } from '@/types/bucket';
import { useToast } from '@/hooks/use-toast';

interface UpiDetails {
  pa: string; // payee address
  pn: string; // payee name
  am?: string; // amount (optional in QR)
  tn?: string; // transaction note
}

interface ScanPayFlowProps {
  isOpen: boolean;
  onClose: () => void;
  buckets: { id: BucketType; name: string; budget: number; spent: number }[];
  onPaymentComplete: (bucketId: BucketType, amount: number, status: 'success' | 'failed') => Promise<void>;
  canAfford: (bucketId: BucketType, amount: number) => boolean;
}

type Step = 'scan' | 'confirm' | 'redirect' | 'result';

function parseUpiQr(data: string): UpiDetails | null {
  try {
    if (!data.toLowerCase().startsWith('upi://pay')) return null;
    const url = new URL(data);
    const pa = url.searchParams.get('pa');
    if (!pa) return null;
    return {
      pa,
      pn: url.searchParams.get('pn') || pa.split('@')[0],
      am: url.searchParams.get('am') || undefined,
      tn: url.searchParams.get('tn') || undefined,
    };
  } catch {
    return null;
  }
}

export const ScanPayFlow = ({ isOpen, onClose, buckets, onPaymentComplete, canAfford }: ScanPayFlowProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('scan');
  const [upiDetails, setUpiDetails] = useState<UpiDetails | null>(null);
  const [amount, setAmount] = useState('');
  const [selectedBucket, setSelectedBucket] = useState<BucketType>('others');
  const [processing, setProcessing] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-scanner-container';

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2) { // SCANNING
          await scannerRef.current.stop();
        }
      } catch (e) {
        console.warn('Scanner stop error:', e);
      }
      scannerRef.current = null;
    }
  }, []);

  const startScanner = useCallback(async () => {
    await stopScanner();
    
    // Wait for DOM element
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const element = document.getElementById(scannerContainerId);
    if (!element) return;

    const scanner = new Html5Qrcode(scannerContainerId);
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          const details = parseUpiQr(decodedText);
          if (details) {
            setUpiDetails(details);
            if (details.am) setAmount(details.am);
            setStep('confirm');
            scanner.stop().catch(() => {});
          } else {
            toast({ title: 'Not a UPI QR', description: 'Please scan a valid UPI QR code', variant: 'destructive' });
          }
        },
        () => {} // ignore scan failures
      );
    } catch (err) {
      console.error('Camera error:', err);
      toast({ title: 'Camera access denied', description: 'Please allow camera access to scan QR codes', variant: 'destructive' });
    }
  }, [stopScanner, toast]);

  useEffect(() => {
    if (isOpen && step === 'scan') {
      startScanner();
    }
    return () => { stopScanner(); };
  }, [isOpen, step, startScanner, stopScanner]);

  const handleClose = useCallback(() => {
    stopScanner();
    setStep('scan');
    setUpiDetails(null);
    setAmount('');
    setSelectedBucket('others');
    onClose();
  }, [stopScanner, onClose]);

  const handlePay = () => {
    if (!upiDetails || !amount) return;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({ title: 'Invalid amount', variant: 'destructive' });
      return;
    }
    if (!canAfford(selectedBucket, numAmount)) {
      toast({ title: 'Insufficient balance', description: `Not enough balance in ${BUCKET_CONFIG[selectedBucket].name}`, variant: 'destructive' });
      return;
    }

    // Build UPI deep link
    const upiUrl = `upi://pay?pa=${encodeURIComponent(upiDetails.pa)}&pn=${encodeURIComponent(upiDetails.pn)}&am=${numAmount}&cu=INR${upiDetails.tn ? `&tn=${encodeURIComponent(upiDetails.tn)}` : ''}`;
    
    setStep('redirect');
    
    // Open UPI app
    window.location.href = upiUrl;
  };

  const handlePaymentResult = async (success: boolean) => {
    if (!upiDetails) return;
    const numAmount = parseFloat(amount);
    setProcessing(true);
    await onPaymentComplete(selectedBucket, numAmount, success ? 'success' : 'failed');
    setProcessing(false);
    setStep('result');

    // Auto close after showing result
    setTimeout(() => {
      handleClose();
    }, 2500);
  };

  if (!isOpen) return null;

  const availableBuckets = buckets.filter(b => b.budget > 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background"
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <button onClick={handleClose} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h2 className="font-semibold text-foreground font-['Space_Grotesk']">
          {step === 'scan' && 'Scan & Pay'}
          {step === 'confirm' && 'Confirm Payment'}
          {step === 'redirect' && 'Complete Payment'}
          {step === 'result' && 'Done'}
        </h2>
        <div className="w-10" />
      </div>

      <div className="p-4 max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {step === 'scan' && (
            <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-square">
                <div id={scannerContainerId} className="w-full h-full" />
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-[250px] h-[250px] border-2 border-primary/50 rounded-xl">
                    <motion.div
                      animate={{ y: [0, 230, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-full h-0.5 bg-primary/80 rounded"
                    />
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Camera className="w-4 h-4" />
                  <p className="text-sm">Point camera at a UPI QR code</p>
                </div>
              </div>

              {/* Manual entry fallback */}
              <div className="border-t border-border pt-4 mt-6">
                <p className="text-xs text-muted-foreground text-center mb-3">Or enter UPI ID manually</p>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const upiId = formData.get('upiId') as string;
                  if (upiId && upiId.includes('@')) {
                    setUpiDetails({ pa: upiId, pn: upiId.split('@')[0] });
                    setStep('confirm');
                    stopScanner();
                  } else {
                    toast({ title: 'Enter a valid UPI ID (e.g. name@upi)', variant: 'destructive' });
                  }
                }} className="flex gap-2">
                  <Input name="upiId" placeholder="name@upi" className="flex-1" />
                  <Button type="submit" size="sm">Go</Button>
                </form>
              </div>
            </motion.div>
          )}

          {step === 'confirm' && upiDetails && (
            <motion.div key="confirm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
              {/* Payee info */}
              <div className="bg-card rounded-2xl p-5 border border-border/50 shadow-soft">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{upiDetails.pn}</p>
                    <p className="text-xs text-muted-foreground">{upiDetails.pa}</p>
                  </div>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      className="pl-9 text-2xl font-bold h-14 font-['Space_Grotesk']"
                      min="1"
                      step="any"
                    />
                  </div>
                </div>

                {/* Bucket selector */}
                <div className="space-y-2 mt-4">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Deduct from</label>
                  <Select value={selectedBucket} onValueChange={(v) => setSelectedBucket(v as BucketType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBuckets.map(b => (
                        <SelectItem key={b.id} value={b.id}>
                          {BUCKET_CONFIG[b.id].icon} {b.name} — ₹{(b.budget - b.spent).toLocaleString()} left
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {amount && parseFloat(amount) > 0 && !canAfford(selectedBucket, parseFloat(amount)) && (
                  <div className="flex items-center gap-2 mt-3 p-2 rounded-lg bg-destructive/10 text-destructive text-xs">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Insufficient balance in this bucket
                  </div>
                )}
              </div>

              <Button
                onClick={handlePay}
                disabled={!amount || parseFloat(amount) <= 0 || !canAfford(selectedBucket, parseFloat(amount) || 0)}
                className="w-full h-12 text-base font-semibold rounded-xl"
              >
                <ScanLine className="w-5 h-5 mr-2" />
                Pay ₹{amount || '0'} via UPI
              </Button>
            </motion.div>
          )}

          {step === 'redirect' && (
            <motion.div key="redirect" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-6 pt-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <ScanLine className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">Complete payment in your UPI app</h3>
                <p className="text-sm text-muted-foreground mt-1">After completing, come back and confirm the status</p>
              </div>

              <div className="space-y-3 pt-4">
                <Button onClick={() => handlePaymentResult(true)} className="w-full h-12 rounded-xl text-base font-semibold gap-2">
                  <Check className="w-5 h-5" /> Payment Successful
                </Button>
                <Button onClick={() => handlePaymentResult(false)} variant="outline" className="w-full h-11 rounded-xl gap-2 text-destructive border-destructive/30">
                  <X className="w-5 h-5" /> Payment Failed / Cancelled
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'result' && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center pt-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
              >
                <Check className="w-10 h-10 text-primary" />
              </motion.div>
              <h3 className="font-bold text-xl text-foreground">Transaction Recorded!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                ₹{amount} to {upiDetails?.pn} from {BUCKET_CONFIG[selectedBucket].name}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
