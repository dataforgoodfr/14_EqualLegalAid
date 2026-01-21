import './ErrorMessage.css';

interface ErrorMessageProps {
  message: string;
  onRetry: () => void;
}

/**
 * Error message component with retry button
 */
export const ErrorMessage = ({ message, onRetry }: ErrorMessageProps) => {
  return (
    <div className="error">
      <p>Error: {message}</p>
      <button onClick={onRetry}>Retry</button>
    </div>
  );
};
