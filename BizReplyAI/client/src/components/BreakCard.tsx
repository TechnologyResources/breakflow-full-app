import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Lock, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreakCardProps {
  type: 'first' | 'second' | 'third';
  duration: number;
  status: 'available' | 'locked' | 'booked' | 'completed' | 'unavailable';
  onBook?: () => void;
  availableSlots?: number;
  totalSlots?: number;
}

export function BreakCard({ 
  type, 
  duration, 
  status, 
  onBook, 
  availableSlots = 0, 
  totalSlots = 0 
}: BreakCardProps) {
  const { t } = useLanguage();

  const titles = {
    first: t('firstBreak'),
    second: t('secondBreak'),
    third: t('thirdBreak'),
  };

  const isInteractive = status === 'available' && onBook;

  const statusIcons = {
    available: null,
    locked: <Lock className="h-5 w-5" />,
    booked: <Clock className="h-5 w-5" />,
    completed: <CheckCircle className="h-5 w-5" />,
    unavailable: <XCircle className="h-5 w-5" />,
  };

  const statusColors = {
    available: 'bg-card',
    locked: 'bg-muted',
    booked: 'bg-primary/10 border-primary',
    completed: 'bg-green-500/10 border-green-500',
    unavailable: 'bg-destructive/10 border-destructive',
  };

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        statusColors[status],
        status === 'locked' && 'opacity-40',
        isInteractive && 'hover-elevate active-elevate-2 cursor-pointer hover:shadow-lg',
        !isInteractive && 'cursor-not-allowed'
      )}
      onClick={isInteractive ? onBook : undefined}
      data-testid={`card-break-${type}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg font-medium">
            {titles[type]}
          </CardTitle>
          {statusIcons[status] && (
            <div className={cn(
              status === 'completed' && 'text-green-500',
              status === 'locked' && 'text-muted-foreground',
              status === 'unavailable' && 'text-destructive',
              status === 'booked' && 'text-primary'
            )}>
              {statusIcons[status]}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-2xl font-bold">{duration}</span>
          <span className="text-sm text-muted-foreground">{t('minutes')}</span>
        </div>

        {status === 'available' && (
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-muted-foreground">
              {t('availableSlots')}
            </div>
            <Badge variant="secondary" className="text-xs">
              {availableSlots} {t('of')} {totalSlots}
            </Badge>
          </div>
        )}

        {status === 'locked' && (
          <div className="text-xs text-muted-foreground pt-2">
            {t('mustTakeFirstBreak')}
          </div>
        )}

        {status === 'booked' && (
          <Badge variant="outline" className="w-full justify-center">
            {t('breakBooked')}
          </Badge>
        )}

        {status === 'completed' && (
          <Badge className="w-full justify-center bg-green-500 hover:bg-green-600">
            {t('breakCompleted')}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
