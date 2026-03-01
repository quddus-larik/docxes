import { DocxesEngine } from '@/core/engine/engine'

export async function getStaticParams() {
  const engine = new DocxesEngine();
  const versions = await engine.getVersions();
  
  const params: Array<{ version: string; slug: string[] }> = [];
  
  for (const version of versions) {
    const docs = await engine.getAllDocs(version);
    for (const doc of docs) {
      params.push({
        version,
        slug: doc.slug,
      });
    }
  }

  return params;
}