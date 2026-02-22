import { getNavigation, getDoc, getVersions, getSearchIndex } from "@/core/hooks/index";

export default async function Page() {

    const data = await getNavigation("latest");
    const docs = await getDoc("latest",["docxes"]);
    const search = await getSearchIndex(["title","description","keywords"]);

    console.log("Navigation:", data);
    console.log("Search Indexes:", search);
    console.log("Doc Data:", docs );
    
    return(
        <>
        
        </>
    )
}