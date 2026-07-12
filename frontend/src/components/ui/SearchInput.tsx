import * as React from "react"
import { Search, X } from "lucide-react"
import { cn } from "../../lib/utils"
import { Input, InputProps } from "./Input"

export interface SearchInputProps extends InputProps {
  onClear?: () => void;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onClear, value, onChange, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        <Search className="absolute left-3 h-4 w-4 text-muted pointer-events-none" />
        <Input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          className={cn("pl-10 pr-10", className)}
          {...props}
        />
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 p-1 rounded-full text-muted hover:text-primary hover:bg-surface-hover transition-colors touch-target-icon"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }
)
SearchInput.displayName = "SearchInput"

export { SearchInput }
