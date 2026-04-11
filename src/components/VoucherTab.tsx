import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VoucherCategory, VoucherTemplate, PurchasedVoucher, VOUCHER_CATEGORIES, VOUCHER_CATALOG } from '@/types/voucher';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Copy, ArrowLeft, ShieldCheck, Ticket, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface VoucherTabProps {
  totalBalance: number;
  purchasedVouchers: PurchasedVoucher[];
  onPurchase: (brand: string, category: string, value: number, totalBalance: number) => Promise<{ success: boolean; code?: string; error?: string }>;
  onBalanceDeducted: () => void;
}

type View = 'catalog' | 'detail' | 'confirm' | 'success' | 'history';

export const VoucherTab = ({ totalBalance, purchasedVouchers, onPurchase, onBalanceDeducted }: VoucherTabProps) => {
  const { toast } = useToast();
  const [view, setView] = useState<View>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<VoucherCategory | 'all'>('all');
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherTemplate | null>(null);
  const [selectedValue, setSelectedValue] = useState<number>(0);
  const [purchasedCode, setPurchasedCode] = useState('');
  const [purchasing, setPurchasing] = useState(false);
  const [copied, setCopied] = useState(false);

  const filteredVouchers = selectedCategory === 'all'
    ? VOUCHER_CATALOG
    : VOUCHER_CATALOG.filter(v => v.category === selectedCategory);

  const handleSelectVoucher = (voucher: VoucherTemplate) => {
    setSelectedVoucher(voucher);
    setSelectedValue(voucher.values[0]);
    setView('detail');
  };

  const handleConfirm = () => setView('confirm');

  const handlePurchase = async () => {
    if (!selectedVoucher) return;
    setPurchasing(true);
    const result = await onPurchase(selectedVoucher.brand, selectedVoucher.category, selectedValue, totalBalance);
    setPurchasing(false);

    if (result.success) {
      setPurchasedCode(result.code || '');
      onBalanceDeducted();
      setView('success');
    } else {
      toast({ title: 'Purchase failed', description: result.error, variant: 'destructive' });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(purchasedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBack = () => {
    if (view === 'detail') setView('catalog');
    else if (view === 'confirm') setView('detail');
    else if (view === 'success' || view === 'history') {
      setView('catalog');
      setSelectedVoucher(null);
    }
  };

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {view === 'catalog' && (
          <motion.div key="catalog" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Balance bar */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Available Balance</p>
                <p className="text-2xl font-bold text-foreground font-['Space_Grotesk']">₹{totalBalance.toLocaleString()}</p>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setView('history')}>
                <Clock className="w-3.5 h-3.5" />
                History
              </Button>
            </div>

            {/* Category pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                }`}
              >
                All
              </button>
              {(Object.entries(VOUCHER_CATEGORIES) as [VoucherCategory, { name: string; icon: string }][]).map(([key, cat]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === key ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>

            {/* Voucher grid */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              {filteredVouchers.map((voucher, i) => (
                <motion.button
                  key={voucher.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => handleSelectVoucher(voucher)}
                  className="bg-card rounded-xl p-4 text-left shadow-soft hover:shadow-md transition-shadow border border-border/50"
                >
                  <span className="text-2xl">{voucher.icon}</span>
                  <p className="font-semibold text-sm mt-2 text-foreground">{voucher.brand}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{voucher.description}</p>
                  <p className="text-xs font-medium text-primary mt-2">From ₹{voucher.values[0]}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {view === 'detail' && selectedVoucher && (
          <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <button onClick={handleBack} className="flex items-center gap-1 text-sm text-muted-foreground mb-4 hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div className="bg-card rounded-2xl p-5 shadow-soft border border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{selectedVoucher.icon}</span>
                <div>
                  <h3 className="font-bold text-lg text-foreground">{selectedVoucher.brand}</h3>
                  <p className="text-sm text-muted-foreground">{selectedVoucher.description}</p>
                </div>
              </div>

              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Select Value</p>
              <div className="grid grid-cols-2 gap-2">
                {selectedVoucher.values.map(val => (
                  <button
                    key={val}
                    onClick={() => setSelectedValue(val)}
                    className={`py-3 rounded-xl text-sm font-semibold transition-all border ${
                      selectedValue === val
                        ? 'bg-primary text-primary-foreground border-primary shadow-md'
                        : 'bg-secondary text-secondary-foreground border-border/50 hover:border-primary/30'
                    }`}
                  >
                    ₹{val}
                  </button>
                ))}
              </div>

              <Button
                onClick={handleConfirm}
                disabled={selectedValue > totalBalance}
                className="w-full mt-5 h-12 text-base font-semibold rounded-xl"
              >
                {selectedValue > totalBalance ? 'Insufficient Balance' : `Buy for ₹${selectedValue}`}
              </Button>
              {selectedValue > totalBalance && (
                <p className="text-xs text-destructive text-center mt-2">You need ₹{(selectedValue - totalBalance).toLocaleString()} more</p>
              )}
            </div>
          </motion.div>
        )}

        {view === 'confirm' && selectedVoucher && (
          <motion.div key="confirm" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <button onClick={handleBack} className="flex items-center gap-1 text-sm text-muted-foreground mb-4 hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 text-center">
              <ShieldCheck className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="font-bold text-lg text-foreground">Confirm Purchase</h3>
              <p className="text-sm text-muted-foreground mt-1">You're buying a {selectedVoucher.brand} voucher</p>

              <div className="bg-secondary rounded-xl p-4 mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Voucher</span>
                  <span className="font-medium text-foreground">{selectedVoucher.brand}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-bold text-foreground">₹{selectedValue}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Balance after</span>
                  <span className="font-medium text-foreground">₹{(totalBalance - selectedValue).toLocaleString()}</span>
                </div>
              </div>

              <Button onClick={handlePurchase} disabled={purchasing} className="w-full mt-5 h-12 text-base font-semibold rounded-xl">
                {purchasing ? 'Processing...' : 'Confirm & Pay'}
              </Button>
            </div>
          </motion.div>
        )}

        {view === 'success' && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Check className="w-8 h-8 text-primary" />
              </motion.div>

              <h3 className="font-bold text-xl text-foreground">Voucher Purchased!</h3>
              <p className="text-sm text-muted-foreground mt-1">{selectedVoucher?.brand} — ₹{selectedValue}</p>

              <div className="bg-secondary rounded-xl p-4 mt-5">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Your Voucher Code</p>
                <p className="text-xl font-mono font-bold text-foreground tracking-widest">{purchasedCode.toUpperCase()}</p>
              </div>

              <Button variant="outline" onClick={handleCopy} className="mt-3 gap-2">
                <Copy className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy Code'}
              </Button>

              <Button onClick={handleBack} className="w-full mt-4 h-11 rounded-xl">
                Browse More Vouchers
              </Button>
            </div>
          </motion.div>
        )}

        {view === 'history' && (
          <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button onClick={handleBack} className="flex items-center gap-1 text-sm text-muted-foreground mb-4 hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <h3 className="font-bold text-lg text-foreground mb-3 flex items-center gap-2">
              <Ticket className="w-5 h-5" /> My Vouchers
            </h3>

            {purchasedVouchers.length === 0 ? (
              <div className="bg-card rounded-xl p-8 text-center border border-border/50">
                <Ticket className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No vouchers purchased yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {purchasedVouchers.map((v) => (
                  <div key={v.id} className="bg-card rounded-xl p-4 border border-border/50 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm text-foreground">{v.brand}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(v.createdAt), 'dd MMM yyyy, hh:mm a')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-foreground">₹{v.value}</p>
                      <Badge variant={v.status === 'active' ? 'default' : 'secondary'} className="text-[10px] mt-0.5">
                        {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
