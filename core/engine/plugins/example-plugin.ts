import { DocxesPlugin } from "../types";

export const examplePlugin: DocxesPlugin = {
  name: "example-plugin",
  hooks: {
    beforeParse: (content) => {
      console.log("Plugin: beforeParse");
      return content;
    },
    afterRender: (code) => {
      console.log("Plugin: afterRender");
      return code;
    },
  },
};
