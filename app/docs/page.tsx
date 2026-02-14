import { redirect } from "next/navigation";
import { XMeta } from "@/x-meta.config";

export default function DocsIndexPage() {
  const defaultVersion = XMeta.versions?.default || "v1";
  redirect(`/docs/${defaultVersion}`);
}
