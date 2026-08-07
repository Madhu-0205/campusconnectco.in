"use client"

import React from "react"

import { cn } from "@/lib/utils"

interface Column<T> {
  header: string
  accessor: keyof T | ((row: T) => React.ReactNode)
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (row: T) => string | number
  onRowClick?: (row: T) => void
  className?: string
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  className
}: DataTableProps<T>) {
  return (
    <div className={cn("w-full overflow-hidden rounded-2xl bg-surface", className)}>
      <div className="overflow-x-auto scrollbar-none">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className={cn("px-6 py-4 whitespace-nowrap", col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-muted-foreground">
                  No data available.
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "transition-colors",
                    onRowClick ? "cursor-pointer hover:bg-surface-2/50" : ""
                  )}
                >
                  {columns.map((col, i) => (
                    <td key={i} className={cn("px-6 py-4", col.className)}>
                      {typeof col.accessor === "function"
                        ? col.accessor(row)
                        : (row[col.accessor] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
