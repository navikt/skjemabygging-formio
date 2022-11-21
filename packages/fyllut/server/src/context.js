import path from "path";
import { fileURLToPath } from "url";

const isTest = process.env.NODE_ENV === "test";
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
export const buildDirectory =
  process.env.FYLLUT_BUILD_DIR || path.join(dirname, isTest ? "./testdata-views" : "../build");
export const buildDirectoryIndexHtml = path.join(buildDirectory, "index.html");
