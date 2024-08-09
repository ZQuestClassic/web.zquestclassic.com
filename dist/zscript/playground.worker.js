"use strict";
(() => {
  // playground.worker.ts
  async function load(path) {
    return (await import(path)).default;
  }
  async function createModule() {
    const [Module, ZScript] = await Promise.all([
      load("./zscript.data.js"),
      load("./zscript.mjs")
    ]);
    Module.noInitialRun = true;
    await ZScript(Module);
    Module.compileScript = Module.cwrap("compile_script", "int", ["string"]);
    return Module;
  }
  function compile(Module, filename) {
    const consolePath = "out.txt";
    const result = Module.compileScript(filename);
    const success = result === 0;
    const output = new TextDecoder().decode(Module.FS.readFile(consolePath));
    const { diagnostics, metadata } = JSON.parse(output);
    return { success, diagnostics, metadata };
  }
  async function setup() {
    let Module;
    self.onmessage = async (e) => {
      const { id, type, data } = e.data;
      try {
        if (type === "init") {
          Module = await createModule();
          self.postMessage({ id });
        } else if (type === "write") {
          const { path, code } = data;
          Module.FS.writeFile(path, code);
          self.postMessage({ id });
        } else if (type === "read") {
          const { path } = data;
          const content = new TextDecoder().decode(Module.FS.readFile(path));
          self.postMessage({ id, result: content });
        } else if (type === "compile") {
          const { path } = data;
          const result = compile(Module, path);
          self.postMessage({ id, result });
        }
      } catch (err) {
        self.postMessage({ id, error: err.toString() });
      }
    };
  }
  setup();
})();
//# sourceMappingURL=playground.worker.js.map
