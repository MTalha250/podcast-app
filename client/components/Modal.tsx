"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className = "",
  size = "md",
}: ModalProps) {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      // Prevent body scroll
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-[95vw] sm:max-w-3xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        className={`relative bg-card/95 backdrop-blur-xl border border-white/20 dark:border-white/20 border-border/20 rounded-xl shadow-2xl shadow-purple-500/20 max-h-[90vh] sm:max-h-[85vh] overflow-hidden w-full ${sizeClasses[size]} animate-in fade-in-0 zoom-in-95 duration-200 ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? "modal-description" : undefined}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 dark:border-white/10 border-border/20">
          <div className="min-w-0 flex-1 pr-4">
            <h2
              id="modal-title"
              className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
            >
              {title}
            </h2>
            {description && (
              <p
                id="modal-description"
                className="text-sm text-muted-foreground mt-1"
              >
                {description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground hover:bg-white/10 w-8 h-8 sm:w-10 sm:h-10"
            aria-label="Close modal"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] sm:max-h-[65vh] overflow-y-auto p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
