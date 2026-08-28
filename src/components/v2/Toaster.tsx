"use client"

import { useTheme } from"next-themes"
import { Toaster as Sonner } from"sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
 const { theme ="system" } = useTheme()

 return (
 <Sonner
 theme={theme as ToasterProps["theme"]}
 className="toaster group"
 toastOptions={{
 classNames: {
 toast:
"group toast group-[.toaster]:bg-surface group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-card-hover group-[.toaster]:backdrop-blur-xl group-[.toaster]:rounded-xl font-body",
 description:"group-[.toast]:text-muted-foreground font-body text-sm",
 actionButton:
"group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium",
 cancelButton:
"group-[.toast]:bg-surface-3 group-[.toast]:text-muted-foreground font-medium",
 },
 }}
 {...props}
 />
 )
}

export { Toaster }
