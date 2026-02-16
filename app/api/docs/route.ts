import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { engine } from "@/lib/engine";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const version = searchParams.get("version") || "v1";

  try {
    switch (type) {
      case "structure":
        const nav = await engine.getNavigation(version);
        return successResponse({ nav, version });
        
      case "versions":
        const versions = await engine.getVersions();
        return successResponse({ versions });

      case "search":
        const docs = await engine.getSearchIndex();
        return successResponse({ docs });

      default:
        return errorResponse("Invalid request type. Use 'structure', 'versions', or 'search'.", 400);
    }
  } catch (error) {
    console.error(`[API_ERROR] ${type}:`, error);
    return errorResponse(`Failed to process ${type} request`);
  }
}
