import * as React from "react"
import { Search } from "lucide-react"
import { cn } from "../../lib/utils"
import { useSearchStore } from "../../store/search.store"

interface SearchBarProps extends React.HTMLAttributes<HTMLButtonElement> {
  placeholder?: string;
}

export function SearchBar({ className, placeholder = "Search...", ...props }: SearchBarProps) {
  const { setOpen } = useSearchStore();

  return (
    <button
      onClick={() => setOpen(true)}
      className={cn(
        "flex w-full items-center space-x-2 rounded-md border border-default bg-surface px-3 py-2 text-sm text-muted shadow-sm hover:border-hover hover:bg-surface-hover transition-colors touch-target",
        className
      )}
      {...props}
    >
      <Search className="h-4 w-4 shrink-0" />
      <span className="flex-1 text-left truncate">{placeholder}</span>
      <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-subtle bg-canvas px-1.5 font-mono text-[10px] font-medium text-muted opacity-100">
        <span className="text-xs">⌘</span>K
      </kbd>
    </button>
  )
}
