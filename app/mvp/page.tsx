// app/page.tsx
import { getPlugin } from "@/lib/plugin-registry";

export default function Page() {
  // TypeScript knows 'button' is valid and knows its props
  const PluginButton = getPlugin("button");

  return (
    <div>
      <PluginButton /> 
    </div>
  );
}