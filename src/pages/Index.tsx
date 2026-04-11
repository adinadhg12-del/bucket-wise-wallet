import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBuckets } from '@/hooks/useBuckets';
import { BucketType } from '@/types/bucket';
import { Bucket } from '@/types/bucket';
import { supabase } from '@/integrations/supabase/client';

import { SplashScreen } from '@/components/SplashScreen';
import { AuthScreen } from '@/components/AuthScreen';
import { OTPScreen } from '@/components/OTPScreen';
import { DailyBonusScreen } from '@/components/DailyBonusScreen';
import { OnboardingScreen } from '@/components/OnboardingScreen';

import { Header } from '@/components/Header';
import { BucketCard } from '@/components/BucketCard';
import { PaymentModal } from '@/components/PaymentModal';
import { BudgetSetupModal } from '@/components/BudgetSetupModal';
import { TransactionList } from '@/components/TransactionList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Wallet, History, Settings2, Ticket, ScanLine } from 'lucide-react';
import { VoucherTab } from '@/components/VoucherTab';
import { useVouchers } from '@/hooks/useVouchers';
import { ScanPayFlow } from '@/components/ScanPayFlow';

type AppPhase = 'splash' | 'auth' | 'otp' | 'daily-bonus' | 'onboarding' | 'home';

const Index = () => {
  const { user, loading: authLoading, signUpOrIn, signOut } = useAuth();
  const [phase, setPhase] = useState<AppPhase>('splash');
  const [authIdentifier, setAuthIdentifier] = useState('');
  const [authType, setAuthType] = useState<'phone' | 'email'>('phone');

  // useBuckets only works when we have a user
  const {
    buckets,
    transactions,
    loading: bucketsLoading,
    updateBudget,
    canAfford,
    recordPayment,
    resetMonth,
    initializeBudgets,
    totalBudget,
    totalSpent,
  } = useBuckets(user?.id || '');

  const {
    purchasedVouchers,
    purchaseVoucher,
    refetch: refetchVouchers,
  } = useVouchers(user?.id || '');

  const [selectedBucket, setSelectedBucket] = useState<Bucket | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [editingBucket, setEditingBucket] = useState<Bucket | null>(null);
  const [isScanPayOpen, setIsScanPayOpen] = useState(false);

  // Handle splash completion
  const handleSplashComplete = useCallback(() => {
    if (user) {
      setPhase('daily-bonus');
    } else {
      setPhase('auth');
    }
  }, [user]);

  // If auth state changes while on auth/otp phase, handle it
  useEffect(() => {
    if (!authLoading && user && (phase === 'auth' || phase === 'otp')) {
      // User just authenticated, check if first-time
      checkFirstTimeUser();
    }
  }, [user, authLoading]);

  const checkFirstTimeUser = async () => {
    if (!user) return;
    const { data } = await (supabase as any)
      .from('profiles')
      .select('is_first_time')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data?.is_first_time) {
      setPhase('onboarding');
    } else {
      setPhase('daily-bonus');
    }
  };

  // Auth handlers
  const handleAuthContinue = (identifier: string, type: 'phone' | 'email') => {
    setAuthIdentifier(identifier);
    setAuthType(type);
    setPhase('otp');
  };

  const handleOTPVerify = async (_otp: string): Promise<{ error: string | null }> => {
    const result = await signUpOrIn(authIdentifier, authType);
    if (result.error) {
      return { error: result.error };
    }
    // The useEffect above will handle phase transition when user state updates
    return { error: null };
  };

  // Onboarding handler
  const handleOnboardingComplete = async (budgets: Record<BucketType, number>) => {
    if (!user) return;
    await initializeBudgets(budgets);

    // Mark user as no longer first-time
    await (supabase as any)
      .from('profiles')
      .update({ is_first_time: false })
      .eq('user_id', user.id);

    setPhase('daily-bonus');
  };

  // Daily bonus continue
  const handleDailyBonusContinue = () => {
    setPhase('home');
  };

  // Logout handler
  const handleLogout = async () => {
    await signOut();
    setPhase('auth');
  };

  // Bucket click handlers
  const handleBucketClick = (bucket: Bucket) => {
    if (bucket.budget === 0) {
      setEditingBucket(bucket);
      setIsBudgetOpen(true);
    } else {
      setSelectedBucket(bucket);
      setIsPaymentOpen(true);
    }
  };

  const handleEditBudget = (bucket: Bucket) => {
    setEditingBucket(bucket);
    setIsBudgetOpen(true);
  };

  // Render based on phase
  switch (phase) {
    case 'splash':
      return <SplashScreen onComplete={handleSplashComplete} />;

    case 'auth':
      return <AuthScreen onContinue={handleAuthContinue} />;

    case 'otp':
      return (
        <OTPScreen
          identifier={authIdentifier}
          type={authType}
          onVerify={handleOTPVerify}
          onBack={() => setPhase('auth')}
        />
      );

    case 'daily-bonus':
      if (!user) return null;
      return (
        <DailyBonusScreen
          userId={user.id}
          onContinue={handleDailyBonusContinue}
        />
      );

    case 'onboarding':
      return <OnboardingScreen onComplete={handleOnboardingComplete} />;

    case 'home':
      return (
        <div className="min-h-screen bg-background pb-8">
          <Header
            totalBudget={totalBudget}
            totalSpent={totalSpent}
            onReset={resetMonth}
            onLogout={handleLogout}
          />

          <main className="px-4 -mt-4">
            <Tabs defaultValue="buckets" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4 h-12 bg-card shadow-soft">
                <TabsTrigger value="buckets" className="gap-2 font-medium">
                  <Wallet className="w-4 h-4" />
                  Buckets
                </TabsTrigger>
                <TabsTrigger value="vouchers" className="gap-2 font-medium">
                  <Ticket className="w-4 h-4" />
                  Vouchers
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

              <TabsContent value="vouchers" className="mt-0">
                <VoucherTab
                  totalBalance={totalBudget - totalSpent}
                  purchasedVouchers={purchasedVouchers}
                  onPurchase={purchaseVoucher}
                  onBalanceDeducted={refetchVouchers}
                />
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

    default:
      return null;
  }
};

export default Index;
