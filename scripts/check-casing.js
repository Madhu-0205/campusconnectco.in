const fs = require("fs");
const path = require("path");

const workspaceDir = path.resolve(__dirname, "..");
const srcDir = path.join(workspaceDir, "src");

// Supported extensions when resolving imports without extensions
const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", "/index.ts", "/index.tsx", "/index.js", "/index.jsx"];

let totalErrors = 0;

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath, callback);
    } else if (/\.(tsx|ts|js|jsx)$/.test(file)) {
      callback(filePath);
    }
  }
}

function parseImports(content) {
  // Strip comments to avoid checking commented-out imports
  const cleaned = content
    .replace(/\/\*[\s\S]*?\*\//g, "") // Block comments
    .replace(/\/\/.*$/gm, "");        // Single-line comments

  const imports = [];
  // Match standard static imports: import ... from 'path' or import 'path'
  const staticImportRegex = /(?:import|export)\s+(?:[\w\s{},*]*\s+from\s+)?['"]([^'"]+)['"]/g;
  // Match dynamic imports: import('path')
  const dynamicImportRegex = /import\(\s*['"]([^'"]+)['"]\s*\)/g;
  // Match commonjs require: require('path')
  const requireRegex = /require\(\s*['"]([^'"]+)['"]\s*\)/g;

  let match;
  while ((match = staticImportRegex.exec(cleaned)) !== null) {
    imports.push(match[1]);
  }
  while ((match = dynamicImportRegex.exec(cleaned)) !== null) {
    imports.push(match[1]);
  }
  while ((match = requireRegex.exec(cleaned)) !== null) {
    imports.push(match[1]);
  }

  return imports.filter(p => p.startsWith("@/") || p.startsWith(".") || p.startsWith(".."));
}

/**
 * Validates if the path segments match the actual file system casing exactly.
 * Traverses segment by segment from the workspace root.
 */
function verifyCasing(importer, relativeOrAliasPath) {
  let absoluteTarget = "";

  if (relativeOrAliasPath.startsWith("@/")) {
    absoluteTarget = path.join(srcDir, relativeOrAliasPath.slice(2));
  } else {
    absoluteTarget = path.resolve(path.dirname(importer), relativeOrAliasPath);
  }

  // Determine standard file candidates
  let possiblePaths = [absoluteTarget];
  if (!path.extname(absoluteTarget) || !fs.existsSync(absoluteTarget)) {
    for (const ext of EXTENSIONS) {
      possiblePaths.push(absoluteTarget + ext);
    }
  }

  // Find which candidate path actually exists
  let targetFile = "";
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      targetFile = p;
      break;
    }
  }

  if (!targetFile) {
    console.error(`❌ Broken import: "${relativeOrAliasPath}" in ${path.relative(workspaceDir, importer)}`);
    totalErrors++;
    return;
  }

  // Perform segment-by-segment check from workspaceDir to targetFile
  const relativeFromRoot = path.relative(workspaceDir, targetFile);
  const segments = relativeFromRoot.split(path.sep);

  let currentPath = workspaceDir;

  for (const segment of segments) {
    if (segment === "." || segment === "..") {
      currentPath = path.resolve(currentPath, segment);
      continue;
    }

    const actualContents = fs.readdirSync(currentPath);
    const exactMatch = actualContents.find(item => item === segment);

    if (!exactMatch) {
      const caseInsensitiveMatch = actualContents.find(item => item.toLowerCase() === segment.toLowerCase());
      if (caseInsensitiveMatch) {
        console.error(`❌ Casing mismatch: Imported "${relativeOrAliasPath}" (resolved as "${relativeFromRoot}") but actual casing on disk is "${path.join(path.relative(workspaceDir, currentPath), caseInsensitiveMatch)}"`);
        totalErrors++;
        return;
      } else {
        console.error(`❌ Segment not found: "${segment}" under "${path.relative(workspaceDir, currentPath)}"`);
        totalErrors++;
        return;
      }
    }

    currentPath = path.join(currentPath, segment);
  }
}

function main() {
  console.log("🔍 Scanning imports for filesystem casing anomalies...");
  walkDir(srcDir, (filePath) => {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      const importPaths = parseImports(content);
      for (const importPath of importPaths) {
        verifyCasing(filePath, importPath);
      }
    } catch (err) {
      console.error(`Failed to process ${filePath}: ${err.message}`);
    }
  });

  if (totalErrors > 0) {
    console.error(`\n❌ Validation failed: Found ${totalErrors} casing/import errors.`);
    process.exit(1);
  } else {
    console.log("\n✅ Verification complete: All import paths match actual filesystem casing!");
    process.exit(0);
  }
}

main();
