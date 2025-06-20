
import React from 'react';

interface ErrorAlertProps {
  message: string | null; // Allow null to match usage
  className?: string;
}

const ErrorAlert = ({ message, className = "" }: ErrorAlertProps): JSX.Element | null => {
  if (!message) return null;

  return (
    <div 
      className={`bg-red-700 bg-opacity-80 border border-red-500 text-red-100 px-4 py-3 rounded-lg relative ${className}`} 
      role="alert"
    >
      <strong className="font-bold">Oops! </strong>
      <span className="block sm:inline">{message}</span>
    </div>
  );
};

export default ErrorAlert;
