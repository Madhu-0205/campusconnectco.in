const fs = require('fs');
const path = require('path');
const ts = require('typescript');

function getFiles(dir) {
  let files = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        files = files.concat(getFiles(filePath));
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      files.push(filePath);
    }
  });
  return files;
}

const isHookName = (name) => /^use[A-Z]/.test(name);

function checkHooks(filePath) {
  const code = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    code,
    ts.ScriptTarget.Latest,
    true
  );

  function visit(node, context) {
    // Keep track of whether we are inside a conditional block or loop
    // or after a return in the current function scope.
    let inConditional = context.inConditional;
    let afterReturn = context.afterReturn;

    if (
      node.kind === ts.SyntaxKind.IfStatement ||
      node.kind === ts.SyntaxKind.ConditionalExpression ||
      node.kind === ts.SyntaxKind.BinaryExpression && (node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken || node.operatorToken.kind === ts.SyntaxKind.BarBarToken) ||
      node.kind === ts.SyntaxKind.SwitchStatement ||
      node.kind === ts.SyntaxKind.ForStatement ||
      node.kind === ts.SyntaxKind.ForInStatement ||
      node.kind === ts.SyntaxKind.ForOfStatement ||
      node.kind === ts.SyntaxKind.WhileStatement ||
      node.kind === ts.SyntaxKind.DoStatement ||
      node.kind === ts.SyntaxKind.TryStatement
    ) {
      inConditional = true;
    }

    // If it's a function declaration, function expression, or arrow function,
    // reset context.afterReturn for the new scope.
    let newContext = { ...context, inConditional };
    if (
      node.kind === ts.SyntaxKind.FunctionDeclaration ||
      node.kind === ts.SyntaxKind.FunctionExpression ||
      node.kind === ts.SyntaxKind.ArrowFunction ||
      node.kind === ts.SyntaxKind.MethodDeclaration
    ) {
      newContext.afterReturn = false;
      // We keep context.inConditional as-is or reset it? Hook calls inside functions inside conditionals
      // are conditional hook calls relative to the outer component rendering.
    }

    // Check if the node is a hook call
    if (node.kind === ts.SyntaxKind.CallExpression) {
      const expression = node.expression;
      let hookName = '';
      if (expression.kind === ts.SyntaxKind.Identifier) {
        hookName = expression.text;
      } else if (expression.kind === ts.SyntaxKind.PropertyAccessExpression) {
        hookName = expression.name.text;
      }

      if (isHookName(hookName)) {
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        const lineContent = code.split('\n')[line];
        if (newContext.inConditional) {
          console.log(`[VIOLATION - CONDITIONAL] ${filePath}:${line + 1}:${character + 1} - Hook ${hookName} called inside a conditional or loop: "${lineContent.trim()}"`);
        }
        if (newContext.afterReturn) {
          console.log(`[VIOLATION - AFTER RETURN] ${filePath}:${line + 1}:${character + 1} - Hook ${hookName} called after return statement: "${lineContent.trim()}"`);
        }
      }
    }

    // Traverse children
    node.forEachChild(child => {
      // If we see a return statement in the block of statements, set afterReturn for subsequent children in the same block/scope.
      visit(child, newContext);
      if (child.kind === ts.SyntaxKind.ReturnStatement) {
        newContext.afterReturn = true;
      }
    });
  }

  visit(sourceFile, { inConditional: false, afterReturn: false });
}

const files = getFiles('/Users/madhu/Desktop/campusconnectco.in-main/src');
console.log(`Checking ${files.length} files...`);
files.forEach(f => {
  try {
    checkHooks(f);
  } catch (err) {
    console.error(`Error processing ${f}:`, err);
  }
});
