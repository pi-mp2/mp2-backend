const path = require("path");
const fs = require("fs");

const distPath = path.resolve("dist");

/**
 * @file fixAliases.js
 * @description
 * Utility script that dynamically replaces TypeScript path aliases (like `@models/`, `@controllers/`, etc.)
 * with correct relative paths inside the compiled JavaScript files located in the `dist/` directory.
 *
 * This script is typically executed after TypeScript compilation to fix import paths
 * so that Node.js can correctly resolve modules at runtime.
 */

/**
 * Computes the relative path between two files, ensuring consistent formatting.
 *
 * @param {string} from - The source file path.
 * @param {string} to - The target file or directory path to which the relative path should be computed.
 * @returns {string} - A properly formatted relative path (e.g., `./utils/db.js`).
 */
function getRelativePath(from, to) {
  let relative = path.relative(path.dirname(from), to);
  if (!relative.startsWith(".")) relative = "./" + relative;
  return relative.replace(/\\/g, "/");
}

/**
 * Replaces TypeScript path aliases within a given JavaScript file
 * by computing their actual relative paths from the file’s location.
 *
 * @param {string} filePath - The absolute path of the `.js` file being processed.
 */
function replaceAliases(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

  /** @type {Record<string, string>} - Map of alias names to their real target folders */
  const aliases = {
    "@config/": "config",
    "@models/": "models",
    "@routes/": "routes",
    "@controllers/": "controllers",
    "@middleware/": "middleware",
    "@utils/": "utils",
  };

  for (const [alias, targetFolder] of Object.entries(aliases)) {
    const regex = new RegExp(alias, "g");
    const targetPath = path.resolve(distPath, targetFolder);
    const relativePath = getRelativePath(filePath, targetPath);
    content = content.replace(regex, relativePath + "/");
  }

  fs.writeFileSync(filePath, content, "utf8");
}

/**
 * Recursively traverses a directory and processes all `.js` files
 * to replace their import aliases with relative paths.
 *
 * @param {string} dir - The directory path to process.
 */
function processDir(dir) {
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (file.endsWith(".js")) {
      replaceAliases(fullPath);
    }
  }
}

/**
 * Starts processing the compiled distribution directory.
 * Logs a confirmation message upon successful completion.
 */
processDir(distPath);
console.log("✅ Alias successfully replaced according to file depth.");
