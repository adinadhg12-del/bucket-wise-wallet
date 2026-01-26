import { Bucket, BucketType } from '@/types/bucket';
import { cn } from '@/lib/utils';

interface BucketCardProps {
  bucket: Bucket;
  onClick: () => void;
}

const bucketColorClass: Record<BucketType, string> = {
  food: 'bg-bucket-food',
  rent: 'bg-bucket-rent',
  transport: 'bg-bucket-transport',
  movies: 'bg-bucket-movies',
  others: 'bg-bucket-others',
};

export const BucketCard = ({ bucket, onClick }: BucketCardProps) => {
  const balance = bucket.budget - bucket.spent;
  const percentage = bucket.budget > 0 ? (bucket.spent / bucket.budget) * 100 : 0;
  const isLow = percentage > 80;
  const isEmpty = balance <= 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full bg-card rounded-lg p-4 shadow-card text-left transition-all duration-200",
        "hover:shadow-elevated hover:scale-[1.02] active:scale-[0.98]",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        "animate-slide-up"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
              bucketColorClass[bucket.id],
              "text-white shadow-soft"
            )}
          >
            {bucket.icon}
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">{bucket.name}</h3>
            <p className="text-sm text-muted-foreground">
              Budget: ₹{bucket.budget.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Balance</span>
          <span
            className={cn(
              "font-semibold",
              isEmpty ? "text-destructive" : isLow ? "text-warning" : "text-success"
            )}
          >
            ₹{balance.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              isEmpty ? "bg-destructive" : isLow ? "bg-warning" : "bg-primary"
            )}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Spent: ₹{bucket.spent.toLocaleString('en-IN')}</span>
          <span>{Math.round(percentage)}% used</span>
        </div>
      </div>
    </button>
  );
};
