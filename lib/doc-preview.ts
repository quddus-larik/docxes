import { notFound } from "next/navigation";
import { getDoc, getVersions } from "@/core/hooks";
import { engine } from "@/lib/engine";

export async function validateVersion(version: string) {
  const versions = await getVersions();

  if (!versions.includes(version)) {
    notFound();
  }

  console.log("version by engine:", versions)
  return versions;
}

export async function resolveDoc(
  version: string,
  slug: string[],
) {
  if (slug.length === 0) {
    return null;
  }

  const doc = await getDoc(version, slug);

  if (!doc) {
    notFound();
  }

  return doc;
}

export function getCurrentPath(
  version: string,
  slug: string[],
) {
  return `/docs/${version}${
    slug.length ? `/${slug.join("/")}` : ""
  }`;
}

export interface NavigationItem {
  href?: string;
  title: string;
  items?: NavigationItem[];
}

export function getPagination(
  navigation: NavigationItem[],
  currentPath: string,
) {
  const flat: { href: string; title: string }[] = [];

  function collect(items: NavigationItem[]) {
    for (const item of items) {
      if (item.href) {
        flat.push({ href: item.href, title: item.title });
      }
      if (item.items) {
        collect(item.items);
      }
    }
  }

  collect(navigation);

  const index = flat.findIndex(
    (item) => item.href === currentPath,
  );

  return {
    prev: index > 0 ? flat[index - 1] : null,
    next: index < flat.length - 1 ? flat[index + 1] : null,
  };
}
