import { RotateCcw, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface HeaderProps {
  totalBudget: number;
  totalSpent: number;
  onReset: () => void;
  onLogout: () => void;
}

export const Header = ({ totalBudget, totalSpent, onReset, onLogout }: HeaderProps) => {
  const remaining = totalBudget - totalSpent;
  const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <header className="bg-primary text-primary-foreground px-4 py-6 rounded-b-3xl shadow-elevated">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💰</span>
          <div>
            <h1 className="font-display text-xl font-bold">Budget Buddy</h1>
            <p className="text-primary-foreground/70 text-xs">Track your spending</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/10 h-9 w-9"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="mx-4 rounded-xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display">Reset Month?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset all spending to zero and clear transaction history. Budgets will remain unchanged.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onReset}>Reset</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            className="text-primary-foreground hover:bg-primary-foreground/10 h-9 w-9"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="bg-primary-foreground/10 rounded-2xl p-4">
        <div className="flex justify-between items-end mb-3">
          <div>
            <p className="text-primary-foreground/70 text-sm">Remaining</p>
            <p className="font-display text-3xl font-bold">
              ₹{remaining.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-primary-foreground/70 text-sm">of ₹{totalBudget.toLocaleString('en-IN')}</p>
            <p className="text-sm font-medium">{Math.round(percentage)}% spent</p>
          </div>
        </div>

        <div className="h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-foreground rounded-full transition-all duration-500"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    </header>
  );
};
