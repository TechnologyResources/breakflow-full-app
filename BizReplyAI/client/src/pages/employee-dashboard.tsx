import { useLanguage } from '@/contexts/LanguageContext';
import { BreakCard } from '@/components/BreakCard';
import { ShiftTimeline } from '@/components/ShiftTimeline';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Clock, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { Shift, Break } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { isUnauthorizedError } from '@/lib/authUtils';

export default function EmployeeDashboard() {
  const { t } = useLanguage();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: shifts, isLoading: shiftsLoading } = useQuery<Shift[]>({
    queryKey: ['/api/shifts/my-shifts'],
    enabled: isAuthenticated,
  });

  const { data: breaks, isLoading: breaksLoading } = useQuery<Break[]>({
    queryKey: ['/api/breaks/my-breaks'],
    enabled: isAuthenticated,
  });

  const bookBreakMutation = useMutation({
    mutationFn: async (breakData: any) => {
      return await apiRequest('POST', '/api/breaks', breakData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/breaks/my-breaks'] });
      toast({
        title: t('success'),
        description: t('breakBookedSuccess'),
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: t('error'),
        description: error.message || t('errorBookingBreak'),
        variant: "destructive",
      });
    },
  });

  const isLoading = authLoading || shiftsLoading || breaksLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 p-8">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  const currentShift = shifts?.[0];
  const hasShift = !!currentShift;

  // Determine break statuses
  const firstBreak = breaks?.find(b => b.breakType === 'first');
  const secondBreak = breaks?.find(b => b.breakType === 'second');
  const thirdBreak = breaks?.find(b => b.breakType === 'third');

  const breakStatuses = {
    first: firstBreak ? 'booked' as const : 'available' as const,
    second: secondBreak ? 'booked' as const : (!firstBreak ? 'locked' as const : 'available' as const),
    third: thirdBreak ? 'booked' as const : (!secondBreak ? 'locked' as const : 'available' as const),
  };

  const handleBookBreak = (breakType: 'first' | 'second' | 'third', duration: number) => {
    if (!currentShift) {
      toast({
        title: t('error'),
        description: "No active shift found",
        variant: "destructive",
      });
      return;
    }

    // Calculate shift boundaries in minutes
    const shiftStart = currentShift.startTime.split(':').map(Number);
    const shiftEnd = currentShift.endTime.split(':').map(Number);
    const shiftStartMinutes = shiftStart[0] * 60 + shiftStart[1];
    const shiftEndMinutes = shiftEnd[0] * 60 + shiftEnd[1];
    
    // Calculate earliest and latest possible times
    const earliestStartMinutes = shiftStartMinutes + 60; // 1 hour after shift start
    const latestEndMinutes = shiftEndMinutes - 60; // 1 hour before shift end
    const latestStartMinutes = latestEndMinutes - duration;
    
    let startMinutes = earliestStartMinutes;
    
    // Adjust for time gap requirements based on previous breaks
    if (breakType === 'second' && firstBreak) {
      const firstEnd = firstBreak.endTime.split(':').map(Number);
      const firstEndMinutes = firstEnd[0] * 60 + firstEnd[1];
      // Must be at least 2 hours after first break ends
      startMinutes = Math.max(startMinutes, firstEndMinutes + 120);
    } else if (breakType === 'third' && secondBreak && firstBreak) {
      const firstEnd = firstBreak.endTime.split(':').map(Number);
      const firstEndMinutes = firstEnd[0] * 60 + firstEnd[1];
      const secondEnd = secondBreak.endTime.split(':').map(Number);
      const secondEndMinutes = secondEnd[0] * 60 + secondEnd[1];
      
      // Must be at least 2.5 hours after second AND 4.5 hours after first
      const minFromSecond = secondEndMinutes + 150; // 2.5 hours
      const minFromFirst = firstEndMinutes + 270; // 4.5 hours
      startMinutes = Math.max(startMinutes, minFromSecond, minFromFirst);
    }
    
    // Verify there's a valid window
    if (startMinutes > latestStartMinutes) {
      toast({
        title: t('error'),
        description: "Cannot schedule break - no valid time slot available within shift constraints",
        variant: "destructive",
      });
      return;
    }
    
    const endMinutes = startMinutes + duration;
    
    const startHour = Math.floor(startMinutes / 60);
    const startMinute = startMinutes % 60;
    const endHour = Math.floor(endMinutes / 60);
    const endMinute = endMinutes % 60;
    
    const startTime = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}:00`;
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}:00`;

    bookBreakMutation.mutate({
      shiftId: currentShift.id,
      userId: user!.id,
      breakType,
      startTime,
      endTime,
      status: 'scheduled',
    });
  };

  if (!hasShift) {
    return (
      <div className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{t('myBreaks')}</h1>
          <p className="text-muted-foreground">{t('loginSubtitle')}</p>
        </div>
        
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold mb-2">No Active Shift</h3>
              <p className="text-muted-foreground text-sm">
                You don't have an active shift scheduled for today
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const formattedBreaks = breaks?.map(b => ({
    type: b.breakType as 'first' | 'second' | 'third',
    startTime: b.startTime,
    endTime: b.endTime,
  })) || [];

  return (
    <div className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{t('myBreaks')}</h1>
        <p className="text-muted-foreground">{t('loginSubtitle')}</p>
      </div>

      {/* Current shift info */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {t('currentShift')}
              </CardTitle>
              <CardDescription>
                {new Date(currentShift.date).toLocaleDateString()}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-lg font-semibold">
                {currentShift.startTime} - {currentShift.endTime}
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Timeline visualization */}
      <ShiftTimeline
        startTime={currentShift.startTime}
        endTime={currentShift.endTime}
        breaks={formattedBreaks}
      />

      {/* Break booking cards */}
      <div>
        <h2 className="text-xl font-semibold mb-4">{t('bookBreak')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BreakCard
            type="first"
            duration={15}
            status={breakStatuses.first}
            onBook={() => handleBookBreak('first', 15)}
            availableSlots={3}
            totalSlots={5}
          />
          <BreakCard
            type="second"
            duration={30}
            status={breakStatuses.second}
            onBook={() => handleBookBreak('second', 30)}
            availableSlots={2}
            totalSlots={5}
          />
          <BreakCard
            type="third"
            duration={15}
            status={breakStatuses.third}
            onBook={() => handleBookBreak('third', 15)}
            availableSlots={4}
            totalSlots={5}
          />
        </div>
      </div>

      {/* Instructions */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="text-lg">Break Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• {t('noBreakFirstHour')}</p>
          <p>• {t('noBreakLastHour')}</p>
          <p>• {t('mustTakeFirstBreak')}</p>
          <p>• There must be 2 hours between first and second break</p>
          <p>• There must be 2.5 hours between second and third break</p>
        </CardContent>
      </Card>
    </div>
  );
}
