import { getNavigation, getDoc, getVersions, getSearchIndex } from "@/core/hooks/index";

export default async function Page() {

    const data = await getNavigation("v1");
    const search = await getSearchIndex(["title","description","keywords"]);
    const docs = await getDoc("v1",["getting-started","installation"]);

    console.log("Navigation:", data);
    console.log("Search Indexes:", search);
    console.log("Doc Data:", docs );
    
    return(
        <>
        
        </>
    )
}