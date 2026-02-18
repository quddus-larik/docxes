import React from "react";
// This is an example adapter for React Router (Vite / Remix)
// It's commented out as it requires react-router-dom to be installed.
/*
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import { DocxesFramework } from "./framework";

export const ReactRouterFramework: DocxesFramework = {
  Link: ({ href, children, ...props }) => (
    <Link to={href} {...props}>
      {children}
    </Link>
  ),
  useRouter: () => {
    const navigate = useNavigate();
    return {
      push: (href) => navigate(href),
      replace: (href) => navigate(href, { replace: true }),
      back: () => navigate(-1),
      forward: () => navigate(1),
    };
  },
  usePathname: () => useLocation().pathname,
  useParams: useParams,
};
*/
