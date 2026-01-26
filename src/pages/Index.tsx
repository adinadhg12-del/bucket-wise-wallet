import { useState } from 'react';
import { useBuckets } from '@/hooks/useBuckets';
import { Bucket } from '@/types/bucket';
import { Header } from '@/components/Header';
import { BucketCard } from '@/components/BucketCard';
import { PaymentModal } from '@/components/PaymentModal';
import { BudgetSetupModal } from '@/components/BudgetSetupModal';
import { TransactionList } from '@/components/TransactionList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Wallet, History, Settings2 } from 'lucide-react';

const Index = () => {
  const {
    buckets,
    transactions,
    updateBudget,
    canAfford,
    recordPayment,
    resetMonth,
    totalBudget,
    totalSpent,
  } = useBuckets();

  const [selectedBucket, setSelectedBucket] = useState<Bucket | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [editingBucket, setEditingBucket] = useState<Bucket | null>(null);

  const handleBucketClick = (bucket: Bucket) => {
    if (bucket.budget === 0) {
      // If no budget set, open budget modal
      setEditingBucket(bucket);
      setIsBudgetOpen(true);
    } else {
      // Open payment modal
      setSelectedBucket(bucket);
      setIsPaymentOpen(true);
    }
  };

  const handleEditBudget = (bucket: Bucket) => {
    setEditingBucket(bucket);
    setIsBudgetOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <Header
        totalBudget={totalBudget}
        totalSpent={totalSpent}
        onReset={resetMonth}
      />

      <main className="px-4 -mt-4">
        <Tabs defaultValue="buckets" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 h-12 bg-card shadow-soft">
            <TabsTrigger value="buckets" className="gap-2 font-medium">
              <Wallet className="w-4 h-4" />
              Buckets
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2 font-medium">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buckets" className="space-y-3 mt-0">
            {buckets.map((bucket, index) => (
              <div key={bucket.id} style={{ animationDelay: `${index * 50}ms` }}>
                <div className="relative">
                  <BucketCard bucket={bucket} onClick={() => handleBucketClick(bucket)} />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditBudget(bucket);
                    }}
                    className="absolute top-3 right-3 h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <Settings2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {totalBudget === 0 && (
              <div className="bg-accent/10 rounded-xl p-4 text-center mt-6">
                <p className="text-accent font-medium">👆 Tap a bucket to set your budget!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Start by setting monthly limits for each category
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <TransactionList transactions={transactions} />
          </TabsContent>
        </Tabs>
      </main>

      <PaymentModal
        bucket={selectedBucket}
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        canAfford={canAfford}
        onPaymentComplete={recordPayment}
      />

      <BudgetSetupModal
        bucket={editingBucket}
        isOpen={isBudgetOpen}
        onClose={() => setIsBudgetOpen(false)}
        onSave={updateBudget}
      />
    </div>
  );
};

export default Index;
