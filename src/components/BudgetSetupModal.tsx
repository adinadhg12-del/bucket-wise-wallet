import { useState, useEffect } from 'react';
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

interface BudgetSetupModalProps {
  bucket: Bucket | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (bucketId: BucketType, budget: number) => void;
}

const bucketColorClass: Record<BucketType, string> = {
  food: 'bg-bucket-food',
  rent: 'bg-bucket-rent',
  transport: 'bg-bucket-transport',
  movies: 'bg-bucket-movies',
  others: 'bg-bucket-others',
};

export const BudgetSetupModal = ({
  bucket,
  isOpen,
  onClose,
  onSave,
}: BudgetSetupModalProps) => {
  const [budget, setBudget] = useState('');

  useEffect(() => {
    if (bucket) {
      setBudget(bucket.budget > 0 ? bucket.budget.toString() : '');
    }
  }, [bucket]);

  const handleSave = () => {
    if (!bucket) return;
    const numericBudget = parseFloat(budget) || 0;
    onSave(bucket.id, numericBudget);
    onClose();
  };

  const handleBudgetChange = (value: string) => {
    const sanitized = value.replace(/[^0-9.]/g, '');
    setBudget(sanitized);
  };

  if (!bucket) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md mx-4 rounded-xl">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center text-xl",
                bucketColorClass[bucket.id],
                "text-white"
              )}
            >
              {bucket.icon}
            </div>
            Set {bucket.name} Budget
          </DialogTitle>
          <DialogDescription>
            Set your monthly spending limit for {bucket.name.toLowerCase()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Monthly Budget (₹)
            </label>
            <Input
              type="text"
              inputMode="decimal"
              placeholder="Enter budget amount"
              value={budget}
              onChange={(e) => handleBudgetChange(e.target.value)}
              className="text-xl font-display h-14 text-center"
              autoFocus
            />
          </div>

          <div className="flex gap-2">
            {[5000, 10000, 20000].map((preset) => (
              <Button
                key={preset}
                variant="outline"
                size="sm"
                onClick={() => setBudget(preset.toString())}
                className="flex-1"
              >
                ₹{preset.toLocaleString('en-IN')}
              </Button>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save Budget
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
