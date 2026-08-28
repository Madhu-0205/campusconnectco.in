import React from"react";

import { cn } from"@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
 return (
 <input
 type={type}
 className={cn(
"flex h-10 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300",
 className
 )}
 ref={ref}
 {...props}
 />
 );
});
Input.displayName ="Input";

export { Input };
