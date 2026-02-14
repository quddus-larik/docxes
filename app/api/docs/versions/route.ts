import { getVersions } from "@/lib/docs"
import { successResponse, errorResponse } from "@/lib/api-response"

export async function GET() {
  try {
    const versions = await getVersions()
    return successResponse({ versions })
  } catch (error) {
    console.error("[VERSIONS_API_ERROR]:", error)
    return errorResponse("Failed to fetch versions")
  }
}
