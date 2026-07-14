import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Drawer } from "vaul";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

interface ResponsiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  trigger?: React.ReactNode;
}

export function ResponsiveModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  trigger
}: ResponsiveModalProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isMobile) {
    return (
      <Drawer.Root open={open} onOpenChange={onOpenChange}>
        {trigger && <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>}
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Drawer.Content className="bg-surface flex flex-col rounded-t-[10px] mt-24 h-fit max-h-[90vh] fixed bottom-0 left-0 right-0 z-50 focus:outline-none shadow-elevated">
            <div className="p-4 bg-surface rounded-t-[10px] flex-1 overflow-y-auto">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-border-default/50 mb-6" />
              {title && (
                <Drawer.Title className="font-bold text-lg text-text-primary mb-1">
                  {title}
                </Drawer.Title>
              )}
              {description && (
                <Drawer.Description className="text-sm text-text-secondary mb-4">
                  {description}
                </Drawer.Description>
              )}
              {children}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-slide-up" style={{ animationDuration: '200ms' }} />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-surface border border-border-default p-6 shadow-elevated sm:rounded-2xl focus:outline-none animate-fade-slide-up" style={{ animationDuration: '250ms' }}>
          {title && (
            <Dialog.Title className="font-bold text-lg text-text-primary mb-1">
              {title}
            </Dialog.Title>
          )}
          {description && (
            <Dialog.Description className="text-sm text-text-secondary mb-4">
              {description}
            </Dialog.Description>
          )}
          {children}
          <Dialog.Close className="absolute right-4 top-4 rounded-[6px] opacity-70 ring-offset-canvas transition-all hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 press-effect">
            <span className="sr-only">Close</span>
            <div className="w-7 h-7 flex items-center justify-center rounded-[6px] bg-surface-hover text-text-muted hover:text-text-primary hover:bg-border-default transition-colors">
              <X className="w-3.5 h-3.5" />
            </div>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
