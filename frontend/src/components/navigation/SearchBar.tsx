import * as React from "react"
import { Search } from "lucide-react"
import { cn } from "../../lib/utils"
import { useSearchStore } from "../../store/search.store"

interface SearchBarProps extends React.HTMLAttributes<HTMLButtonElement> {
  placeholder?: string;
}

export function SearchBar({ className, placeholder = "Search operations, members...", ...props }: SearchBarProps) {
  const { setOpen } = useSearchStore();

  return (
    <button
      onClick={() => setOpen(true)}
      className={cn(
        "flex w-full items-center space-x-2 rounded-xl border border-border-default bg-surface px-3.5 py-2.5 text-xs text-text-muted shadow-2xs hover:border-border-hover hover:bg-surface-hover transition-all min-h-[44px] cursor-pointer group",
        className
      )}
      {...props}
    >
      <Search className="h-4 w-4 shrink-0 group-hover:text-text-primary transition-colors" />
      <span className="flex-1 text-left truncate font-medium group-hover:text-text-primary transition-colors">{placeholder}</span>
      <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded-md border border-border-default bg-canvas px-1.5 font-mono text-[10px] font-semibold text-text-muted shadow-2xs">
        <span className="text-xs">⌘</span>K
      </kbd>
    </button>
  )
}

