import { BeforeMount, Monaco } from "@monaco-editor/react";
import type { editor, languages } from "monaco-editor";
import PQueue from "p-queue";

export function createWorkerQueue(worker) {
  const queue = new PQueue({ concurrency: 1 });
  return {
    worker,
    emit(data) {
      queue.clear();
      const _id = Math.random().toString(36).substr(2, 5);
      worker.postMessage({ _current: _id });
      return queue.add(
        () =>
          new Promise((resolve) => {
            function onMessage(event) {
              if (event.data._id !== _id) return;
              worker.removeEventListener("message", onMessage);
              resolve(event.data);
            }
            worker.addEventListener("message", onMessage);
            worker.postMessage({ ...data, _id });
          })
      );
    },
    terminate() {
      worker.terminate();
    },
  };
}

export function requestResponse(worker, data) {
  return new Promise((resolve) => {
    const _id = Math.random().toString(36).substr(2, 5);
    function onMessage(event) {
      if (event.data._id !== _id) return;
      worker.removeEventListener("message", onMessage);
      resolve(event.data);
    }
    worker.addEventListener("message", onMessage);
    worker.postMessage({ ...data, _id });
  });
}

export const onBeforeEditorMount: BeforeMount = async (monaco) => {
  const diagOpts: languages.typescript.DiagnosticsOptions = {
    noSemanticValidation: true,
    noSyntaxValidation: false,
  };

  const compilerOpts: languages.typescript.CompilerOptions = {
    target: monaco.languages.typescript.ScriptTarget.Latest,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    noEmit: true,
    baseUrl: ".",
    esModuleInterop: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    reactNamespace: "React",
    allowJs: true,
    typeRoots: ["node_modules/@types"],
  };

  monaco.languages.typescript.javascriptDefaults.setCompilerOptions(
    compilerOpts
  );

  monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
    compilerOpts
  );

  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(
    diagOpts
  );

  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions(
    diagOpts
  );

  monaco.languages.typescript.typescriptDefaults.setMaximumWorkerIdleTime(-1);
  monaco.languages.typescript.javascriptDefaults.setMaximumWorkerIdleTime(-1);

  monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
  monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
};