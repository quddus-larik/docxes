import Link from "next/link";
import { useRouter as useNextRouter, usePathname as useNextPathname, useParams as useNextParams } from "next/navigation";
import { DocxesFramework } from "./framework";
import React from "react";

export const NextFramework: DocxesFramework = {
  Link: ({ href, children, ...props }) => (
    <Link href={href} {...props}>
      {children}
    </Link>
  ),
  useRouter: () => {
    const router = useNextRouter();
    return {
      push: (href) => router.push(href),
      replace: (href) => router.replace(href),
      back: () => router.back(),
      forward: () => router.forward(),
    };
  },
  usePathname: useNextPathname,
  useParams: useNextParams,
}
