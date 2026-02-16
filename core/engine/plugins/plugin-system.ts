import { DocxesPlugin, PluginHooks } from "../types";

export class PluginSystem {
  private plugins: DocxesPlugin[] = [];

  constructor(plugins: DocxesPlugin[] = []) {
    this.plugins = plugins;
  }

  async runHook<K extends keyof PluginHooks>(
    hookName: K,
    initialData: any
  ): Promise<any> {
    let data = initialData;
    for (const plugin of this.plugins) {
      const hook = plugin.hooks[hookName];
      if (hook) {
        data = await (hook as any)(data);
      }
    }
    return data;
  }
}
