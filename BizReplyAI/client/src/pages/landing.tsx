import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import backgroundImage from '@assets/generated_images/Animated_gradient_corporate_background_0f50df9f.png';
import { Clock } from 'lucide-react';

export default function Landing() {
  const { t } = useLanguage();

  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6">
      {/* Animated background with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          animation: 'backgroundPan 30s ease-in-out infinite alternate',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-sm" />
      </div>

      {/* Language switcher in top-right */}
      <div className="absolute top-6 right-6 z-10">
        <LanguageSwitcher />
      </div>

      {/* Login card */}
      <Card className="w-full max-w-md shadow-2xl relative z-10" data-testid="card-login">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-lg bg-primary flex items-center justify-center">
              <Clock className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">{t('loginTitle')}</CardTitle>
          <CardDescription className="text-base">{t('loginSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleLogin}
            className="w-full h-12 text-base font-medium"
            size="lg"
            data-testid="button-login"
          >
            {t('loginAsEmployee')}
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">
            {t('loginAsAdmin')}
          </div>
        </CardContent>
      </Card>

      <style>{`
        @keyframes backgroundPan {
          0% {
            background-position: 0% 0%;
          }
          100% {
            background-position: 100% 100%;
          }
        }
      `}</style>
    </div>
  );
}
