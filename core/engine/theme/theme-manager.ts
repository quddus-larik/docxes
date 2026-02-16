export interface ThemeConfig {
  layouts: Record<string, any>;
  components: Record<string, any>;
}

export class ThemeManager {
  private config: ThemeConfig;

  constructor(config: ThemeConfig) {
    this.config = config;
  }

  getLayout(name: string = "default") {
    return this.config.layouts[name] || this.config.layouts["default"];
  }

  getComponents() {
    return this.config.components;
  }
}
