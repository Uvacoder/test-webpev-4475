import * as esbuild from "esbuild-wasm";
import axios from "axios";
import localforage from "localforage";
import { normalizeCss } from "./esbuild.utils";

const fileCache = localforage.createInstance({
	name: "filecache",
});

export const fetchPlugin = (inputCode: string) => ({
	name: "fetch-plugin",

	setup(build: esbuild.PluginBuild) {
		build.onLoad({ filter: /^index\.js$/ }, async () => {
			return {
				loader: "jsx",
				contents: inputCode,
			};
		});

		build.onLoad({ filter: /.*/ }, async (args: any) => {
			/**
			 * Check if module is already in filecache
			 * if yes? return it immediately
			 *
			 * if not, fetch it from unpkg and cache it
			 * and return the result
			 */
			const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(args.path);

			if (cachedResult) {
				return cachedResult;
			}

			return null;
		});

		build.onLoad({ filter: /.css$/ }, async (args: any) => {
			const { data, request } = await axios.get(args.path);

			const contents = normalizeCss(data);

			const result: esbuild.OnLoadResult = {
				loader: "jsx",
				contents,
				resolveDir: new URL("./", request.responseURL).pathname,
			};

			await fileCache.setItem(args.path, result);

			return result;
		});

		build.onLoad({ filter: /.*/ }, async (args: any) => {
			const { data, request } = await axios.get(args.path);

			const result: esbuild.OnLoadResult = {
				loader: "jsx",
				contents: data,
				resolveDir: new URL("./", request.responseURL).pathname,
			};

			await fileCache.setItem(args.path, result);

			return result;
		});
	},
});