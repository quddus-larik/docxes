import { NextRequest } from "next/server";
import { generateNavigation, getVersions } from "@/lib/docs";
import { indexAllDocs } from "@/lib/search-index";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const version = searchParams.get("version") || "v1";

  try {
    switch (type) {
      case "structure":
        const nav = await generateNavigation(version);
        return successResponse({ nav, version });
        
      case "versions":
        const versions = await getVersions();
        return successResponse({ versions });

      case "search":
        const docs = await indexAllDocs();
        return successResponse({ docs });

      default:
        return errorResponse("Invalid request type. Use 'structure', 'versions', or 'search'.", 400);
    }
  } catch (error) {
    console.error(`[API_ERROR] ${type}:`, error);
    return errorResponse(`Failed to process ${type} request`);
  }
}
