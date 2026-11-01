import React from 'react';

interface ErrorAlertProps {
  title: string;
  message: string;
  details?: string[];
  onRetry?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title,
  message,
  details,
  onRetry,
}) => {
  return (
    <div className="p-4 rounded-2xl bg-error-container text-on-error-container border border-error/20 flex flex-col gap-2">
      <div className="flex items-center gap-2 font-bold text-base">
        <span className="material-symbols-outlined text-error">error</span>
        <span>{title}</span>
      </div>
      <p className="text-sm leading-relaxed">{message}</p>
      {details && details.length > 0 && (
        <ul className="list-disc list-inside text-xs space-y-1 mt-1 text-on-error-container/80">
          {details.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          type="button"
          className="self-start mt-2 px-3 py-1.5 rounded-lg bg-error text-white text-xs font-semibold hover:bg-error/90 transition-colors"
        >
          ลองใหม่อีกครั้ง
        </button>
      )}
    </div>
  );
};
