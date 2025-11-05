import type { ErrorInfo } from 'react';

export const useErrorHandler = () => {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo);
    // Implementar lógica adicional como envio para serviços de monitoramento, se desejado
  };
};

