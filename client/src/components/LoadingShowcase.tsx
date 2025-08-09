import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Loading, 
  DoctorLoading, 
  HealthcareLoading, 
  PulseLoading 
} from '@/components/ui/loading';

const LoadingShowcase: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const triggerLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Healthcare Loading Animations</h1>
        <p className="text-gray-600">Enhanced loading components with doctor icons and healthcare-themed animations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Default Loading */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Default Loading</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Loading text="Loading..." />
            <Button 
              onClick={triggerLoading} 
              className="mt-4 w-full"
              disabled={isLoading}
            >
              {isLoading ? <Loading size="sm" /> : 'Test Loading'}
            </Button>
          </CardContent>
        </Card>

        {/* Doctor Loading */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Doctor Loading</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <DoctorLoading text="Loading medical data..." />
            <Button 
              onClick={triggerLoading} 
              className="mt-4 w-full"
              disabled={isLoading}
            >
              {isLoading ? <DoctorLoading size="sm" /> : 'Test Doctor Loading'}
            </Button>
          </CardContent>
        </Card>

        {/* Healthcare Loading */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Healthcare Loading</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <HealthcareLoading text="Processing healthcare info..." />
            <Button 
              onClick={triggerLoading} 
              className="mt-4 w-full"
              disabled={isLoading}
            >
              {isLoading ? <HealthcareLoading size="sm" /> : 'Test Healthcare Loading'}
            </Button>
          </CardContent>
        </Card>

        {/* Pulse Loading */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pulse Loading</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <PulseLoading text="Loading with pulse..." />
            <Button 
              onClick={triggerLoading} 
              className="mt-4 w-full"
              disabled={isLoading}
            >
              {isLoading ? <PulseLoading size="sm" /> : 'Test Pulse Loading'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Size Variants */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Size Variants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <h4 className="font-medium mb-2">Small</h4>
              <DoctorLoading size="sm" text="Small loading..." />
            </div>
            <div className="text-center">
              <h4 className="font-medium mb-2">Medium</h4>
              <DoctorLoading size="md" text="Medium loading..." />
            </div>
            <div className="text-center">
              <h4 className="font-medium mb-2">Large</h4>
              <DoctorLoading size="lg" text="Large loading..." />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Animation Showcase */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Animation Showcase</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <h4 className="font-medium mb-4">Doctor Icon with Rotating Ring</h4>
              <DoctorLoading text="Medical data loading..." />
              <p className="text-sm text-gray-600 mt-2">
                Features a stethoscope icon with a rotating ring animation
              </p>
            </div>
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <h4 className="font-medium mb-4">Healthcare Icons with Gradient</h4>
              <HealthcareLoading text="Healthcare processing..." />
              <p className="text-sm text-gray-600 mt-2">
                Multiple healthcare icons with gradient ring animation
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Interactive Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-gray-600">Click the buttons below to see the loading animations in action</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => setIsLoading(false), 2000);
                }}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? <DoctorLoading size="sm" /> : 'Load Medical Data'}
              </Button>
              <Button 
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => setIsLoading(false), 2500);
                }}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? <HealthcareLoading size="sm" /> : 'Process Health Info'}
              </Button>
              <Button 
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => setIsLoading(false), 3000);
                }}
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? <PulseLoading size="sm" /> : 'Sync Health Records'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadingShowcase;
