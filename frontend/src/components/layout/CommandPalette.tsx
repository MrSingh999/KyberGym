import { useState, useEffect } from "react";
import { Command } from "cmdk";
import { Search, User, CreditCard, Dumbbell, Building2 } from "lucide-react";
import { useNavigate } from "react-router";
import { useSearchStore } from "../../store/search.store";

export function CommandPalette() {
  const { isOpen: open, setOpen, toggleOpen } = useSearchStore();
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleOpen();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm sm:flex sm:items-start sm:justify-center sm:pt-[15vh]">
      <Command 
        className="w-full h-full sm:h-auto sm:max-h-[60vh] sm:max-w-2xl bg-canvas sm:bg-elevated sm:border sm:border-default sm:rounded-2xl shadow-elevated overflow-hidden animate-fade-slide-up flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center border-b border-subtle px-4 shrink-0 bg-surface">
          <Search className="w-5 h-5 text-muted mr-3" />
          <Command.Input 
            autoFocus
            placeholder="Type a command or search..." 
            className="flex-1 h-14 sm:h-14 bg-transparent outline-none text-primary placeholder:text-muted text-body"
          />
          <button 
            className="sm:hidden text-muted p-2 active:scale-95 touch-target-icon"
            onClick={() => setOpen(false)}
          >
            Cancel
          </button>
        </div>
        
        <Command.List className="flex-1 overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-sm text-muted">No results found.</Command.Empty>

          <Command.Group heading="Quick Actions" className="text-xs font-semibold text-muted mb-2 px-2">
            <Command.Item 
              onSelect={() => runCommand(() => navigate('/dashboard/members/new'))}
              className="flex items-center px-3 py-3 sm:py-2.5 rounded-md cursor-pointer text-sm text-secondary hover:bg-surface-hover hover:text-primary transition-colors aria-selected:bg-surface-hover aria-selected:text-primary"
            >
              <User className="mr-3 h-5 w-5 sm:h-4 sm:w-4" />
              Add New Member
            </Command.Item>
            <Command.Item 
              onSelect={() => runCommand(() => navigate('/dashboard/payments/new'))}
              className="flex items-center px-3 py-3 sm:py-2.5 rounded-md cursor-pointer text-sm text-secondary hover:bg-surface-hover hover:text-primary transition-colors aria-selected:bg-surface-hover aria-selected:text-primary"
            >
              <CreditCard className="mr-3 h-5 w-5 sm:h-4 sm:w-4" />
              Create Invoice
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Navigation" className="text-xs font-semibold text-muted mb-2 px-2 mt-4">
            <Command.Item 
              onSelect={() => runCommand(() => navigate('/dashboard/workouts'))}
              className="flex items-center px-3 py-3 sm:py-2.5 rounded-md cursor-pointer text-sm text-secondary hover:bg-surface-hover hover:text-primary transition-colors aria-selected:bg-surface-hover aria-selected:text-primary"
            >
              <Dumbbell className="mr-3 h-5 w-5 sm:h-4 sm:w-4" />
              Manage Workouts
            </Command.Item>
            <Command.Item 
              onSelect={() => runCommand(() => navigate('/admin/gyms'))}
              className="flex items-center px-3 py-3 sm:py-2.5 rounded-md cursor-pointer text-sm text-secondary hover:bg-surface-hover hover:text-primary transition-colors aria-selected:bg-surface-hover aria-selected:text-primary"
            >
              <Building2 className="mr-3 h-5 w-5 sm:h-4 sm:w-4" />
              Manage Gyms (Super Admin)
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
      
      {/* Click outside to close (Desktop only) */}
      <div className="absolute inset-0 -z-10 hidden sm:block" onClick={() => setOpen(false)} />
    </div>
  );
}
