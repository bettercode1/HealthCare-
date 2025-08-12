import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Loading, 
  DoctorLoading, 
  HealthcareLoading, 
  PulseLoading 
} from '@/components/ui/loading';
import BettercodeLogo from './BettercodeLogo';

const LoadingShowcase: React.FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const triggerLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('healthcareLoadingAnimations')}</h1>
        <p className="text-gray-600">{t('enhancedLoadingComponents')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Default Loading */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('defaultLoading')}</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Loading text={t('loading')} />
            <Button 
              onClick={triggerLoading} 
              className="mt-4 w-full"
              disabled={isLoading}
            >
              {isLoading ? <Loading size="sm" /> : t('testLoading')}
            </Button>
          </CardContent>
        </Card>

        {/* Doctor Loading */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('doctorLoading')}</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <DoctorLoading text={t('loadingMedicalData')} />
            <Button 
              onClick={triggerLoading} 
              className="mt-4 w-full"
              disabled={isLoading}
            >
              {isLoading ? <DoctorLoading size="sm" /> : t('testDoctorLoading')}
            </Button>
          </CardContent>
        </Card>

        {/* Healthcare Loading */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('healthcareLoading')}</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <HealthcareLoading text={t('processingHealthcareInfo')} />
            <Button 
              onClick={triggerLoading} 
              className="mt-4 w-full"
              disabled={isLoading}
            >
              {isLoading ? <HealthcareLoading size="sm" /> : t('testHealthcareLoading')}
            </Button>
          </CardContent>
        </Card>

        {/* Pulse Loading */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('pulseLoading')}</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <PulseLoading text={t('loadingWithPulse')} />
            <Button 
              onClick={triggerLoading} 
              className="mt-4 w-full"
              disabled={isLoading}
            >
              {isLoading ? <PulseLoading size="sm" /> : t('testPulseLoading')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Size Variants */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('sizeVariants')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <h4 className="font-medium mb-2">{t('small')}</h4>
              <DoctorLoading size="sm" text={`${t('small')} loading...`} />
            </div>
            <div className="text-center">
              <h4 className="font-medium mb-2">{t('medium')}</h4>
              <DoctorLoading size="md" text={`${t('medium')} loading...`} />
            </div>
            <div className="text-center">
              <h4 className="font-medium mb-2">{t('large')}</h4>
              <DoctorLoading size="lg" text={`${t('large')} loading...`} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Animation Showcase */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('animationShowcase')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <h4 className="font-medium mb-4">{t('doctorIconWithRotatingRing')}</h4>
              <DoctorLoading text={t('medicalDataLoading')} />
              <p className="text-sm text-gray-600 mt-2">
                {t('rotatingRingDescription')}
              </p>
            </div>
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <h4 className="font-medium mb-4">{t('healthcareIconsWithGradient')}</h4>
              <HealthcareLoading text={t('healthcareProcessing')} />
              <p className="text-sm text-gray-600 mt-2">
                {t('gradientDescription')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('interactiveDemo')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-gray-600">{t('clickButtonsToSeeAnimations')}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => setIsLoading(false), 2000);
                }}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? <DoctorLoading size="sm" /> : t('loadMedicalData')}
              </Button>
              <Button 
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => setIsLoading(false), 2500);
                }}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? <HealthcareLoading size="sm" /> : t('processHealthInfo')}
              </Button>
              <Button 
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => setIsLoading(false), 3000);
                }}
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? <PulseLoading size="sm" /> : t('syncHealthRecords')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bettercode Logo */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <BettercodeLogo variant="compact" className="justify-center" />
      </div>
    </div>
  );
};

export default LoadingShowcase;
