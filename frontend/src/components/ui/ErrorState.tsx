"use client";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = "Something went wrong. Please try again.", onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <div className="w-12 h-12 border border-gold/40 flex items-center justify-center">
        <span className="text-gold text-xl">!</span>
      </div>
      <p className="text-text-muted max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 text-xs uppercase tracking-widest text-gold border border-gold/40 px-5 py-2 hover:bg-gold/10 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
