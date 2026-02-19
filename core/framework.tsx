import React, { createContext, useContext } from "react";

export interface DocxesFramework {
  Link: React.ComponentType<{ 
    href: string; 
    children: React.ReactNode; 
    className?: string; 
    style?: React.CSSProperties; 
    onClick?: () => void;
    [key: string]: any;
  }>;
  useRouter: () => {
    push: (href: string) => void;
    replace: (href: string) => void;
    back: () => void;
    forward: () => void;
  };
  usePathname: () => string;
  useParams: () => Record<string, string | string[] | undefined>;
}

const FrameworkContext = createContext<DocxesFramework | null>(null);

export function DocxesFrameworkProvider({ 
  framework, 
  children 
}: { 
  framework: DocxesFramework; 
  children: React.ReactNode; 
}) {
  return (
    <FrameworkContext.Provider value={framework}>
      {children}
    </FrameworkContext.Provider>
  );
}

export function useFramework() {
  const context = useContext(FrameworkContext);
  if (!context) {
    throw new Error("useFramework must be used within a DocxesFrameworkProvider");
  }
  return context;
}
