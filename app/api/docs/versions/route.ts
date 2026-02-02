import { NextResponse } from "next/server"
import { getVersions } from "@/lib/docs"

export async function GET() {
  try {
    const versions = await getVersions()
    
    // Sort logic is likely handled in getVersions now (it sorts), 
    // but if we need numeric sort (v1, v2, v10) we might need to apply it again or ensure lib/docs does it.
    // The lib/docs simple sort() might sort v10 before v2. 
    // Let's implement robust sort here or rely on lib/docs if it's fine.
    // For now, let's keep the semantic version sort if possible, but getVersions returns strings.
    
    // The previous implementation had specific sort logic for "vN".
    const sortedVersions = versions.sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, "") || "0");
        const numB = parseInt(b.replace(/\D/g, "") || "0");
        return numA - numB;
    });

    return NextResponse.json({ versions: sortedVersions })
  } catch (error) {
    console.error("Error fetching versions:", error)
    return NextResponse.json({ versions: [], error: "Failed to fetch versions" }, { status: 500 })
  }
}
