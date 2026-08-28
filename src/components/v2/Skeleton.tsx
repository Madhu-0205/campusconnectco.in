import { cn } from"@/lib/utils"

function Skeleton({
 className,
 ...props
}: React.HTMLAttributes<HTMLDivElement>) {
 return (
 <div
 className={cn(
"relative overflow-hidden rounded-md bg-surface-2",
"before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-linear-to-r before:from-transparent before:via-white/5 before:to-transparent",
 className
 )}
 {...props}
 />
 )
}

export { Skeleton }
