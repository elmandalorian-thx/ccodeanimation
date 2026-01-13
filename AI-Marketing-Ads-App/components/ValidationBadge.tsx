import { ValidationError } from '../services/validationService';

interface ValidationBadgeProps {
  errors: ValidationError[];
  charCount?: {
    current: number;
    max: number;
  };
}

/**
 * ValidationBadge Component
 * Displays validation status with color-coded badges and tooltips
 *
 * Statuses:
 * - ✓ Valid (green): No errors, within limits
 * - ⚠ Warning (yellow): Warnings only (emoji count, capitalization, etc.)
 * - ✗ Error (red): Hard errors (exceeds max length, below min length)
 */
export function ValidationBadge({ errors, charCount }: ValidationBadgeProps) {
  const hasErrors = errors.some(e => e.severity === 'error');
  const hasWarnings = errors.some(e => e.severity === 'warning');

  // Determine status
  const status = hasErrors ? 'error' : hasWarnings ? 'warning' : 'valid';

  // Character count status (for color coding)
  let charStatus: 'safe' | 'warning' | 'error' = 'safe';
  if (charCount) {
    const ratio = charCount.current / charCount.max;
    if (ratio > 1) charStatus = 'error';
    else if (ratio > 0.9) charStatus = 'warning';
  }

  // Badge colors based on status
  const statusColors = {
    valid: 'bg-green-900/50 border-green-500 text-green-300',
    warning: 'bg-yellow-900/50 border-yellow-500 text-yellow-300',
    error: 'bg-red-900/50 border-red-500 text-red-300'
  };

  const charCountColors = {
    safe: 'text-slate-400',
    warning: 'text-yellow-400',
    error: 'text-red-400'
  };

  // Icons
  const statusIcons = {
    valid: '✓',
    warning: '⚠',
    error: '✗'
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      {/* Character Counter */}
      {charCount && (
        <span className={`font-mono ${charCountColors[charStatus]}`}>
          {charCount.current}/{charCount.max}
        </span>
      )}

      {/* Validation Badge */}
      <div className="relative group">
        <div
          className={`px-2 py-1 rounded border ${statusColors[status]} text-xs font-medium flex items-center gap-1`}
        >
          <span>{statusIcons[status]}</span>
          <span>
            {status === 'valid' && 'Valid'}
            {status === 'warning' && `${errors.length} Warning${errors.length > 1 ? 's' : ''}`}
            {status === 'error' && `${errors.filter(e => e.severity === 'error').length} Error${errors.filter(e => e.severity === 'error').length > 1 ? 's' : ''}`}
          </span>
        </div>

        {/* Tooltip on hover - show error messages */}
        {errors.length > 0 && (
          <div className="absolute left-0 top-full mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-10 shadow-lg">
            <div className="text-xs space-y-2">
              {errors.map((error, index) => (
                <div
                  key={index}
                  className={`${
                    error.severity === 'error' ? 'text-red-300' : 'text-yellow-300'
                  }`}
                >
                  <span className="font-bold">
                    {error.severity === 'error' ? '✗' : '⚠'}
                  </span>{' '}
                  {error.message}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
