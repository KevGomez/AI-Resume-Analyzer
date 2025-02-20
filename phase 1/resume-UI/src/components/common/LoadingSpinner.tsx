interface LoadingSpinnerProps {
  fullScreen?: boolean;
  text?: string;
}

export default function LoadingSpinner({ fullScreen = false, text = 'Loading...' }: LoadingSpinnerProps) {
  const containerClasses = fullScreen
    ? 'fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50'
    : 'flex items-center justify-center min-h-[60vh]';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-4 bg-white dark:bg-dark-200 p-6 rounded-lg shadow-xl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        {text && (
          <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
            {text}
          </p>
        )}
      </div>
    </div>
  );
} 