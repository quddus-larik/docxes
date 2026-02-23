import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getNavigation, getSearchIndex, getVersions, getVersionMetadata, getVersionsMetadata } from "@/core/hooks";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const version = searchParams.get("version") || "v1";

  try {
    switch (type) {
      case "structure":
        const nav = await getNavigation(version);
        const metadata = await getVersionMetadata(version);
        return successResponse({ nav, version, metadata });
        
      case "versions":
        const versions = await getVersions();
        const versionsMetadata = await getVersionsMetadata();
        return successResponse({ versions, versionsMetadata });

      case "search":
        const docs = await getSearchIndex();
        return successResponse({ docs });

      default:
        return errorResponse("Invalid request type. Use 'structure', 'versions', or 'search'.", 400);
    }
  } catch (error) {
    console.error(`[API_ERROR] ${type}:`, error);
    return errorResponse(`Failed to process ${type} request`);
  }
}
