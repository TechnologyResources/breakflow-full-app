import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TimeSlot {
  hour: number;
  isRestricted: boolean; // first or last hour
  breaks: {
    type: 'first' | 'second' | 'third';
    startMinute: number;
    endMinute: number;
  }[];
}

interface ShiftTimelineProps {
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  breaks?: {
    type: 'first' | 'second' | 'third';
    startTime: string;
    endTime: string;
  }[];
}

export function ShiftTimeline({ startTime, endTime, breaks = [] }: ShiftTimelineProps) {
  const { t } = useLanguage();

  const parseTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return { hours, minutes };
  };

  const start = parseTime(startTime);
  const end = parseTime(endTime);
  
  const totalHours = 8; // Always 8 hour shifts
  const hours = Array.from({ length: totalHours }, (_, i) => {
    const hour = (start.hours + i) % 24;
    return hour;
  });

  const isFirstHour = (hourIndex: number) => hourIndex === 0;
  const isLastHour = (hourIndex: number) => hourIndex === totalHours - 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">{t('currentShift')}</CardTitle>
        <div className="text-sm text-muted-foreground">
          {startTime} {t('to')} {endTime}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Hour markers */}
          <div className="flex gap-1">
            {hours.map((hour, index) => (
              <div
                key={index}
                className={cn(
                  'flex-1 h-16 rounded-md border-2 relative overflow-hidden transition-all',
                  (isFirstHour(index) || isLastHour(index)) 
                    ? 'bg-destructive/10 border-destructive/30' 
                    : 'bg-card border-border'
                )}
                data-testid={`timeline-hour-${index}`}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-xs font-semibold">
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                  {(isFirstHour(index) || isLastHour(index)) && (
                    <div className="text-[10px] text-destructive text-center px-1 mt-1">
                      {isFirstHour(index) ? t('noBreakFirstHour') : t('noBreakLastHour')}
                    </div>
                  )}
                </div>
                
                {/* Break indicators */}
                {breaks.map((breakItem, breakIndex) => {
                  const breakStart = parseTime(breakItem.startTime);
                  const breakStartMinutes = breakStart.hours * 60 + breakStart.minutes;
                  const hourStartMinutes = ((start.hours + index) % 24) * 60;
                  
                  if (breakStartMinutes >= hourStartMinutes && breakStartMinutes < hourStartMinutes + 60) {
                    const offsetMinutes = breakStartMinutes - hourStartMinutes;
                    const leftPercent = (offsetMinutes / 60) * 100;
                    
                    return (
                      <div
                        key={breakIndex}
                        className={cn(
                          'absolute top-0 bottom-0 w-1 bg-primary rounded-full',
                          breakItem.type === 'first' && 'bg-blue-500',
                          breakItem.type === 'second' && 'bg-green-500',
                          breakItem.type === 'third' && 'bg-orange-500'
                        )}
                        style={{ left: `${leftPercent}%` }}
                      />
                    );
                  }
                  return null;
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs">
              <div className="h-3 w-3 rounded bg-blue-500" />
              <span>{t('firstBreak')} (15{t('min')})</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="h-3 w-3 rounded bg-green-500" />
              <span>{t('secondBreak')} (30{t('min')})</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="h-3 w-3 rounded bg-orange-500" />
              <span>{t('thirdBreak')} (15{t('min')})</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
