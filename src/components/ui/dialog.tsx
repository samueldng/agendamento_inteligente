import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface DialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const DialogContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>({ open: false, onOpenChange: () => {} });

const Dialog: React.FC<DialogProps> = ({ children, open = false, onOpenChange = () => {} }) => {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
};

const DialogTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const { onOpenChange } = React.useContext(DialogContext);
  
  return (
    <button
      className={cn(className)}
      onClick={() => onOpenChange(true)}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});
DialogTrigger.displayName = "DialogTrigger";

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { open, onOpenChange } = React.useContext(DialogContext);
  
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={() => onOpenChange(false)}
      />
      <div
        className={cn(
          "relative z-50 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg",
          className
        )}
        ref={ref}
        {...props}
      >
        <button
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
});
DialogContent.displayName = "DialogContent";

const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    ref={ref}
    {...props}
  />
));
DialogHeader.displayName = "DialogHeader";

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    ref={ref}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    className={cn("text-sm text-muted-foreground", className)}
    ref={ref}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
};