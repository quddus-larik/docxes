import { generateNavigation } from "@/lib/docs"
import { successResponse, errorResponse } from "@/lib/api-response"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const version = searchParams.get("version") || "v1"

  try {
    const nav = await generateNavigation(version)
    return successResponse({ nav, version })
  } catch (error) {
    console.error("[STRUCTURE_API_ERROR]:", error)
    return errorResponse("Failed to generate navigation")
  }
}
