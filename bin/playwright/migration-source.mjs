import { createHash } from 'node:crypto';
import ts from 'typescript';

const printer = ts.createPrinter({ removeComments: true });
const hash = (text) => createHash('sha256').update(text).digest('hex');
const titleOf = (node) => {
  if (!node) throw new Error('Missing test title');
  return ts.isStringLiteralLike(node) ? node.text : node.getText();
};

const parseSource = (path, text) => {
  const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);
  const tests = [];
  const hooks = [];
  const canonical = (node) => printer.printNode(ts.EmitHint.Unspecified, node, source);
  const line = (node) => source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
  const visit = (node, scopes = [], inheritedModifiers = []) => {
    if (ts.isCallExpression(node)) {
      const name = node.expression.getText(source);
      if (/^describe(?:\.(?:skip|only))?$/.test(name)) {
        const next = [...scopes, titleOf(node.arguments[0])];
        const modifiers = [...inheritedModifiers, ...name.split('.').slice(1)];
        node.arguments.slice(1).forEach((arg) => visit(arg, next, modifiers));
        return;
      }
      if (/^it(?:\.(?:skip|only))?$/.test(name)) {
        const title = titleOf(node.arguments[0]);
        const start = node.getStart(source);
        const end = node.getEnd();
        const statement = node.parent;
        const comments = ts.getLeadingCommentRanges(text, statement.getFullStart()) ?? [];
        tests.push({
          title,
          scopes,
          proposedTitlePath: [...scopes, title],
          line: source.getLineAndCharacterOfPosition(start).line + 1,
          endLine: source.getLineAndCharacterOfPosition(end).line + 1,
          sourceHash: hash(canonical(node)),
          buildOnly: node.getText(source).includes('cy.skipIfNoIncludeDistTests('),
          modifiers: [...inheritedModifiers, ...name.split('.').slice(1)],
          referenceComments: comments.map(({ pos, end }) => text.slice(pos, end)),
        });
        return;
      }
      if (/^(before|beforeEach|after|afterEach)$/.test(name)) {
        hooks.push({
          type: name,
          scopes,
          line: line(node),
          sourceHash: hash(canonical(node)),
        });
      }
    }
    ts.forEachChild(node, (child) => visit(child, scopes, inheritedModifiers));
  };
  visit(source);
  for (const test of tests) {
    const applicableHooks = hooks.filter(
      (hook) =>
        hook.scopes.length <= test.scopes.length && hook.scopes.every((scope, index) => scope === test.scopes[index]),
    );
    test.sourceHash = hash(JSON.stringify([test.sourceHash, ...applicableHooks.map((hook) => hook.sourceHash)]));
  }
  return { sourceHash: hash(printer.printFile(source)), tests, hooks };
};

export { hash, parseSource };
