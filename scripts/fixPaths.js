const path = require("path");
const fs = require("fs");

const distPath = path.resolve("dist");

function getRelativePath(from, to) {
  let relative = path.relative(path.dirname(from), to);
  if (!relative.startsWith(".")) relative = "./" + relative;
  return relative.replace(/\\/g, "/");
}

function replaceAliases(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

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

processDir(distPath);
console.log("✅ Alias reemplazados correctamente según la profundidad de los archivos.");