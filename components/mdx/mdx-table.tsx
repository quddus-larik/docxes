"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface TableProps extends React.ComponentProps<"table"> {
  headers?: string[]
  rows?: (string | React.ReactNode)[][]
}

export function MdxTable({ headers, rows, children, ...props }: TableProps) {
  // If headers and rows are provided, render them (custom usage)
  if (headers && rows) {
    return (
      <div className="my-6 w-full overflow-y-auto rounded-md border border-border">
        <Table {...props}>
          <TableHeader>
            <TableRow>
              {headers.map((header, index) => (
                <TableHead key={index}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <TableCell key={cellIndex}>{cell}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  // Otherwise, render children (standard MDX usage)
  return (
    <div className="my-6 w-full overflow-hidden rounded-md border border-border">
      <Table {...props} className="min-w-full">
        {children}
      </Table>
    </div>
  )
}
