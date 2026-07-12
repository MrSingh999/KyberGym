import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface PlansSearchProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

export function PlansSearch({ value, onChange, placeholder = 'Search plans…', className }: PlansSearchProps) {
  const [local, setLocal] = useState(value);

  // Debounce: fire onChange 300ms after the user stops typing
  useEffect(() => {
    const id = setTimeout(() => onChange(local), 300);
    return () => clearTimeout(id);
  }, [local, onChange]);

  // Sync when parent resets
  useEffect(() => {
    setLocal(value);
  }, [value]);

  return (
    <div className={cn('relative flex-1 max-w-sm', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
      <input
        type="search"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-9 py-2.5 text-sm bg-surface border border-default rounded-xl text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
      />
      {local && (
        <button
          onClick={() => { setLocal(''); onChange(''); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
