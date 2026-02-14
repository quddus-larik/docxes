import { indexAllDocs } from "@/lib/search-index"
import { successResponse, errorResponse } from "@/lib/api-response"

export async function GET() {
  try {
    const docs = await indexAllDocs()
    return successResponse({ docs })
  } catch (error) {
    console.error("[SEARCH_API_ERROR]:", error)
    return errorResponse("Failed to index documents")
  }
}
