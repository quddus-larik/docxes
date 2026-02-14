import { NextResponse } from "next/server"

export type ApiResponse<T> = {
  data?: T
  error?: string
  version?: string
}

export function successResponse<T>(data: T, headers?: Record<string, string>) {
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      ...headers,
    },
  })
}

export function errorResponse(message: string, status: number = 500) {
  return NextResponse.json(
    { error: message },
    { status }
  )
}
