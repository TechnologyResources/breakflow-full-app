import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { Department } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function AdminDepartments() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [editingDept, setEditingDept] = useState<number | null>(null);
  const [sliderValues, setSliderValues] = useState<Record<number, number>>({});

  const { data: departments, isLoading } = useQuery<Department[]>({
    queryKey: ['/api/departments'],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Department> }) => {
      return await apiRequest('PATCH', `/api/departments/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/departments'] });
      toast({
        title: t('success'),
        description: "Department updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSliderChange = (deptId: number, value: number[]) => {
    setSliderValues(prev => ({ ...prev, [deptId]: value[0] }));
  };

  const handleSliderCommit = (deptId: number) => {
    const newValue = sliderValues[deptId];
    if (newValue !== undefined) {
      updateMutation.mutate({
        id: deptId,
        data: { maxConcurrentBreaks: newValue },
      });
    }
  };

  const handleToggle24Hours = (deptId: number, currentValue: boolean) => {
    updateMutation.mutate({
      id: deptId,
      data: { is24Hours: !currentValue },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-8 p-6 md:p-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{t('departments')}</h1>
          <p className="text-muted-foreground">
            Manage departments and break settings
          </p>
        </div>
        <Button 
          data-testid="button-add-department"
          variant="outline"
          disabled
          title="Feature coming soon"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('addDepartment')}
        </Button>
      </div>

      {/* Departments List */}
      {departments && departments.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {departments.map((dept) => {
            const currentSliderValue = sliderValues[dept.id] ?? dept.maxConcurrentBreaks;
            
            return (
              <Card key={dept.id} data-testid={`card-department-${dept.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 flex-1 min-w-0">
                      <CardTitle className="text-xl truncate">{dept.name}</CardTitle>
                      <CardDescription className="truncate">
                        {language === 'ar' && dept.nameAr ? dept.nameAr : dept.name}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        disabled
                        title="Feature coming soon"
                        data-testid={`button-edit-department-${dept.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        disabled
                        title="Feature coming soon"
                        data-testid={`button-delete-department-${dept.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Employees count */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Employees</span>
                    <Badge variant="secondary">20</Badge>
                  </div>

                  {/* 24/7 Toggle */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5 flex-1">
                      <Label htmlFor={`24hours-${dept.id}`} className="text-sm font-medium">
                        24/7 Operations
                      </Label>
                      <div className="text-xs text-muted-foreground">
                        Department operates around the clock
                      </div>
                    </div>
                    <Switch
                      id={`24hours-${dept.id}`}
                      checked={dept.is24Hours}
                      onCheckedChange={() => handleToggle24Hours(dept.id, dept.is24Hours)}
                      data-testid={`switch-24hours-${dept.id}`}
                    />
                  </div>

                  {/* Max Concurrent Breaks Slider */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        {t('maxConcurrentBreaks')}
                      </Label>
                      <span className="text-2xl font-bold text-primary">
                        {currentSliderValue}
                      </span>
                    </div>
                    <Slider
                      value={[currentSliderValue]}
                      onValueChange={(value) => handleSliderChange(dept.id, value)}
                      onValueCommit={() => handleSliderCommit(dept.id)}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                      data-testid={`slider-max-breaks-${dept.id}`}
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum number of employees who can take breaks simultaneously
                    </p>
                  </div>

                  {/* Availability visualization */}
                  <div className="pt-2">
                    <div className="text-xs text-muted-foreground mb-2">
                      Current Break Capacity
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {Array.from({ length: currentSliderValue }).map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 min-w-[2.5rem] h-8 rounded bg-muted flex items-center justify-center text-xs font-medium"
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="text-lg font-semibold">{t('noDepartments')}</div>
            <p className="text-muted-foreground text-sm">
              Go to the dashboard to initialize departments
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
