import { Transaction, BUCKET_CONFIG } from '@/types/bucket';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransactionListProps {
  transactions: Transaction[];
}

export const TransactionList = ({ transactions }: TransactionListProps) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-lg">No transactions yet</p>
        <p className="text-sm">Make a payment to see it here</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.slice(0, 10).map((tx) => {
        const bucket = BUCKET_CONFIG[tx.bucketId];
        const date = new Date(tx.date);
        
        return (
          <div
            key={tx.id}
            className={cn(
              "flex items-center gap-3 p-3 bg-card rounded-lg shadow-soft",
              "animate-slide-up"
            )}
          >
            <div className="text-2xl">{bucket.icon}</div>
            <div className="flex-1">
              <p className="font-medium text-foreground">{bucket.name}</p>
              <p className="text-xs text-muted-foreground">
                {date.toLocaleDateString('en-IN', { 
                  day: 'numeric', 
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="text-right">
              <p className={cn(
                "font-semibold",
                tx.status === 'success' ? "text-foreground" : "text-destructive line-through"
              )}>
                -₹{tx.amount.toLocaleString('en-IN')}
              </p>
              {tx.status === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-success inline" />
              ) : (
                <XCircle className="w-4 h-4 text-destructive inline" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
