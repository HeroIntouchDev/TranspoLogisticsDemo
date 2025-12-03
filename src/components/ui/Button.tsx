import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
    size?: "sm" | "md" | "lg" | "icon";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
                    {
                        "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm": variant === "primary",
                        "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-sm": variant === "secondary",
                        "border border-border bg-surface hover:bg-surface-hover text-foreground": variant === "outline",
                        "hover:bg-surface-hover text-foreground": variant === "ghost",
                        "bg-danger text-white hover:bg-danger/90 shadow-sm": variant === "destructive",
                        "h-9 px-3 text-xs": size === "sm",
                        "h-10 px-4 py-2 text-sm": size === "md",
                        "h-12 px-6 text-base": size === "lg",
                        "h-10 w-10 p-0": size === "icon",
                    },
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button };
