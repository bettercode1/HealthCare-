import React from 'react';
import { Stethoscope, Heart, Activity, Shield, Zap, Brain, Pill, UserCheck, ActivitySquare } from 'lucide-react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  variant?: 'default' | 'doctor' | 'healthcare' | 'medical';
}

export const Loading: React.FC<LoadingProps> = ({ 
  size = 'md', 
  text = 'Loading...', 
  className = '',
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  if (variant === 'doctor') {
    return (
      <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
        <div className="relative">
          {/* Professional doctor loading */}
          <div className="flex items-center justify-center">
            <div className={`${iconSizes[size]} text-blue-600`}>
              <Stethoscope className="w-full h-full" />
            </div>
          </div>
        </div>
        
        {text && (
          <div className="text-center">
            <span className="text-gray-700 font-medium text-sm">{text}</span>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'healthcare') {
    return (
      <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
        <div className="relative">
          {/* Professional healthcare loading */}
          <div className="flex items-center justify-center">
            <div className={`${iconSizes[size]} text-green-600`}>
              <Heart className="w-full h-full" fill="currentColor" />
            </div>
          </div>
        </div>
        
        {text && (
          <div className="text-center">
            <span className="text-gray-700 font-medium text-sm">{text}</span>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'medical') {
    return (
      <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
        <div className="relative">
          {/* Professional medical loading */}
          <div className="flex items-center justify-center">
            <div className={`${iconSizes[size]} text-blue-600`}>
              <Stethoscope className="w-full h-full" />
            </div>
          </div>
        </div>
        
        {text && (
          <div className="text-center">
            <span className="text-gray-700 font-medium text-sm">{text}</span>
          </div>
        )}
      </div>
    );
  }

  // Default loading spinner
  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <div 
        className={`${sizeClasses[size]} border-2 border-gray-200 border-t-primary rounded-full animate-spin`}
        style={{ borderTopColor: 'hsl(207, 90%, 54%)' }}
      ></div>
      {text && <span className="text-gray-600">{text}</span>}
    </div>
  );
};

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  );
};

export const LoadingCard: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  );
};

// New healthcare-specific loading components
export const DoctorLoading: React.FC<{ text?: string; className?: string }> = ({ 
  text = 'Loading medical data...', 
  className = '' 
}) => {
  return <Loading variant="doctor" text={text} className={className} />;
};

export const HealthcareLoading: React.FC<{ text?: string; className?: string }> = ({ 
  text = 'Processing healthcare information...', 
  className = '' 
}) => {
  return <Loading variant="healthcare" text={text} className={className} />;
};

export const PulseLoading: React.FC<{ text?: string; className?: string }> = ({ 
  text = 'Loading...', 
  className = '' 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <div className="relative">
        {/* Professional pulse loading */}
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 bg-blue-600 rounded-full">
            <div className="w-full h-full flex items-center justify-center">
              <Pill className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>
      
      {text && (
        <div className="text-center">
          <span className="text-gray-700 font-medium text-sm">{text}</span>
        </div>
      )}
    </div>
  );
};

export const MedicalLoading: React.FC<{ text?: string; className?: string }> = ({ 
  text = 'Processing medical data...', 
  className = '' 
}) => {
  return <Loading variant="medical" text={text} className={className} />;
};
