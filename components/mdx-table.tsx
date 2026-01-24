"use client"

import type React from "react"

interface TableProps {
  headers: string[]
  rows: (string | React.ReactNode)[][]
  caption?: string
}

export function MdxTable({ headers, rows, caption }: TableProps) {
  return (
    <div className="my-4 overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/50">
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="px-4 py-3 text-left font-semibold text-foreground">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-border last:border-b-0 hover:bg-muted/50">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3 text-muted-foreground">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {caption && <div className="bg-muted/30 px-4 py-2 text-center text-xs text-muted-foreground">{caption}</div>}
    </div>
  )
}
