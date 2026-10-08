const groupTypes = new Set(['container', 'datagrid', 'row']);
const layoutTypes = new Set(['navSkjemagruppe', 'fieldset', 'columns', 'well', 'panel']);
const nonFillableTypes = new Set(['accordion', 'alertstripe', 'button', 'content', 'hidden', 'htmlelement', 'image']);

const hasSimpleConditional = (component) =>
  typeof component.conditional?.when === 'string' && component.conditional.when.trim() !== '';

const hasCustomConditional = (component) =>
  typeof component.customConditional === 'string' && component.customConditional.trim() !== '';

const hasUnsupportedConditional = (component) =>
  Boolean(component.conditional?.json || component.conditional?.conditions);

const getChildLists = (component) => [
  ...(Array.isArray(component.components) ? [component.components] : []),
  ...(Array.isArray(component.columns) ? component.columns.map((column) => column?.components ?? []) : []),
];

const parsePath = (path) => {
  const rows = [];
  const template = path.replace(/\[(\d+)\]/g, (_, index) => {
    rows.push(Number(index));
    return '';
  });
  return { template, rows };
};

const buildModel = (form) => {
  const nodes = [];
  const pages = [];

  const visit = (component, { parent, parentPath, position, page }) => {
    if (!component || typeof component !== 'object') {
      return;
    }
    const contributesPath = Boolean(component.key) && Boolean(component.tree || component.input);
    const path = contributesPath ? (parentPath ? `${parentPath}.${component.key}` : component.key) : parentPath;
    const node = {
      component,
      key: component.key,
      type: component.type,
      label: component.label ?? component.title ?? component.key,
      path,
      parent,
      page,
      position,
      isDatagrid: component.type === 'datagrid',
      isFillable:
        component.input === true &&
        !groupTypes.has(component.type) &&
        !nonFillableTypes.has(component.type) &&
        !component.hidden &&
        !component.readOnly &&
        !component.disabled,
      required: component.validate?.required === true,
    };
    nodes.push(node);
    let childIndex = 0;
    for (const children of getChildLists(component)) {
      for (const child of children) {
        visit(child, { parent: node, parentPath: path, position: [...position, childIndex], page });
        childIndex += 1;
      }
    }
    return node;
  };

  (form.components ?? []).forEach((component, index) => {
    const page = {
      index,
      key: component?.key,
      title: component?.title ?? component?.label ?? component?.key,
      isPanel: component?.type === 'panel',
      isAttachmentPanel: component?.isAttachmentPanel === true,
    };
    pages.push(page);
    page.node = visit(component, { parent: undefined, parentPath: '', position: [index], page });
  });

  const byPath = new Map();
  const byKey = new Map();
  for (const node of nodes) {
    if (node.path && (node.isFillable || groupTypes.has(node.type)) && !byPath.has(node.path)) {
      byPath.set(node.path, node);
    }
    if (node.key) {
      byKey.set(node.key, [...(byKey.get(node.key) ?? []), node]);
    }
  }

  return { form, nodes, pages, byPath, byKey };
};

const getAncestors = (node) => {
  const ancestors = [];
  for (let current = node.parent; current; current = current.parent) {
    ancestors.unshift(current);
  }
  return ancestors;
};

const getDatagridAncestors = (node) => getAncestors(node).filter((ancestor) => ancestor.isDatagrid);

const getRowBase = (node) => {
  for (let current = node.parent; current; current = current.parent) {
    if (current.path && groupTypes.has(current.type)) {
      return current;
    }
  }
  return undefined;
};

// Resolve a data path such as "a.b.c" to the closest fillable or group node, plus any sub-path inside it.
const resolveTemplatePath = (model, template) => {
  const segments = template.split('.');
  for (let length = segments.length; length > 0; length -= 1) {
    const node = model.byPath.get(segments.slice(0, length).join('.'));
    if (node) {
      return { node, subPath: segments.slice(length).join('.') };
    }
  }
  return undefined;
};

const resolveReference = (model, fromNode, reference, scope) => {
  if (scope === 'row') {
    const rowBase = getRowBase(fromNode);
    if (rowBase) {
      const scoped = resolveTemplatePath(model, `${rowBase.path}.${reference}`);
      if (scoped) {
        return scoped;
      }
    }
  }
  const direct = resolveTemplatePath(model, reference);
  if (direct) {
    return direct;
  }
  if (!reference.includes('.')) {
    const candidates = (model.byKey.get(reference) ?? []).filter((node) => node.path);
    const rowBase = getRowBase(fromNode);
    const sameScope = candidates.find((node) => rowBase && node.path.startsWith(`${rowBase.path}.`));
    const match = sameScope ?? candidates[0];
    if (match) {
      return { node: match, subPath: '' };
    }
  }
  return undefined;
};

const normalizeExpression = (expression) => expression.replace(/\s+/g, ' ').trim();

const extractCustomReferences = (expression) => {
  const references = [];
  const add = (scope, path) => {
    if (path && !references.some((entry) => entry.scope === scope && entry.path === path)) {
      references.push({ scope, path });
    }
  };
  for (const [, scope, path] of expression.matchAll(/\b(data|row)((?:\.[A-Za-z_$][\w$]*)+)/g)) {
    add(scope, path.slice(1));
  }
  for (const [, scope, path] of expression.matchAll(/\b(data|row)\[\s*['"]([^'"]+)['"]\s*\]/g)) {
    add(scope, path);
  }
  for (const [, scope, path] of expression.matchAll(/_\.get\(\s*(data|row)\s*,\s*['"]([^'"]+)['"]/g)) {
    add(scope, path);
  }
  for (const [, path] of expression.matchAll(/\butils\.\w+\(\s*['"]([^'"]+)['"]/g)) {
    add('data', path);
  }
  const usesSubmissionMethod = /isSubmission(Paper|Digital|Nologin)\b|submissionMethod/.test(expression);
  return { references, usesSubmissionMethod };
};

const getConditionals = (model, node) => {
  const conditionals = [];
  for (const target of [...getAncestors(node), node]) {
    const { component } = target;
    if (component.hidden && target !== node) {
      conditionals.push({ owner: target, kind: 'hidden' });
    }
    if (hasCustomConditional(component)) {
      const expression = normalizeExpression(component.customConditional);
      const { references, usesSubmissionMethod } = extractCustomReferences(expression);
      conditionals.push({
        owner: target,
        kind: 'custom',
        expression,
        usesSubmissionMethod,
        dependencies: references
          .map((reference) => ({
            ...reference,
            resolved: resolveReference(model, target, reference.path, reference.scope),
          }))
          .filter(
            (dependency, index, all) =>
              !dependency.resolved ||
              all.findIndex((other) => other.resolved?.node === dependency.resolved.node) === index,
          ),
      });
    } else if (hasUnsupportedConditional(component)) {
      conditionals.push({ owner: target, kind: 'unsupported' });
    } else if (hasSimpleConditional(component)) {
      const when = component.conditional.when.trim();
      conditionals.push({
        owner: target,
        kind: 'simple',
        when,
        eq: component.conditional.eq,
        show: component.conditional.show,
        dependencies: [{ scope: 'data', path: when, resolved: resolveReference(model, target, when, 'row') }],
      });
    }
  }
  return conditionals;
};

const concretePath = (node, rows, subPath = '') => {
  const datagrids = getDatagridAncestors(node);
  let path = node.path;
  datagrids
    .map((datagrid, index) => ({ datagrid, row: rows[index] ?? 0 }))
    .reverse()
    .forEach(({ datagrid, row }) => {
      path = `${datagrid.path}[${row}]${path.slice(datagrid.path.length)}`;
    });
  if (node.isDatagrid && rows.length > datagrids.length) {
    path = `${path}[${rows[datagrids.length]}]`;
  }
  return subPath ? `${path}.${subPath}` : path;
};

const pathTokens = (path) =>
  path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean);

const getByPath = (data, path) =>
  pathTokens(path).reduce((value, token) => (value == null ? undefined : value[token]), data);

const setByPath = (data, path, value) => {
  const tokens = pathTokens(path);
  let current = data;
  tokens.forEach((token, index) => {
    if (index === tokens.length - 1) {
      current[token] = value;
      return;
    }
    if (current[token] == null || typeof current[token] !== 'object') {
      current[token] = /^\d+$/.test(tokens[index + 1]) ? [] : {};
    }
    current = current[token];
  });
};

const deleteByPath = (data, path) => {
  const tokens = pathTokens(path);
  const parent = getByPath(data, tokens.slice(0, -1).join('.'));
  if (parent && typeof parent === 'object') {
    delete parent[tokens.at(-1)];
  }
};

const isEmpty = (value) =>
  value == null ||
  value === '' ||
  (Array.isArray(value) && value.length === 0) ||
  (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0);

// Mirrors checkSimpleConditional in packages/shared-domain/src/utils/check-condition/simpleCondition.ts.
const evaluateSimple = (conditional, value) => {
  const normalized =
    value == null || (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0)
      ? ''
      : value;
  const eq = String(conditional.eq);
  const show = String(conditional.show);
  if (normalized && typeof normalized === 'object' && !Array.isArray(normalized) && Object.hasOwn(normalized, eq)) {
    return String(normalized[eq]) === show;
  }
  if (Array.isArray(normalized) && normalized.map(String).includes(eq)) {
    return show === 'true';
  }
  return (String(normalized) === eq) === (show === 'true');
};

const describeConditional = (conditional) => {
  if (conditional.kind === 'simple') {
    return `${String(conditional.show) === 'true' ? 'show' : 'hide'} when ${conditional.when} = ${JSON.stringify(conditional.eq)}`;
  }
  if (conditional.kind === 'custom') {
    return `custom: ${conditional.expression}`;
  }
  if (conditional.kind === 'hidden') {
    return 'hidden component';
  }
  return 'unsupported JSON conditional, treated as visible';
};

const lookupAssumption = (assumptions, owner, rows) => {
  for (const candidate of [concretePath(owner, rows), owner.path, owner.key]) {
    if (candidate && Object.hasOwn(assumptions, candidate)) {
      return assumptions[candidate];
    }
  }
  return undefined;
};

const evaluateVisibility = (model, node, rows, data, assumptions) => {
  const reasons = [];
  let status = 'visible';
  for (const conditional of getConditionals(model, node)) {
    const { owner } = conditional;
    const ownerRows = rows.slice(0, getDatagridAncestors(owner).length);
    let visible;
    if (conditional.kind === 'hidden') {
      visible = false;
    } else if (conditional.kind === 'unsupported') {
      visible = true;
    } else if (conditional.kind === 'simple') {
      const resolved = conditional.dependencies[0].resolved;
      const value = resolved
        ? getByPath(data, concretePath(resolved.node, ownerRows, resolved.subPath))
        : getByPath(data, conditional.when);
      visible = evaluateSimple(conditional, value);
    } else {
      const assumption = lookupAssumption(assumptions, owner, ownerRows);
      if (typeof assumption === 'boolean') {
        visible = assumption;
      } else {
        status = status === 'hidden' ? status : 'unknown';
        reasons.push({ owner, conditional, result: 'unknown' });
        continue;
      }
    }
    if (!visible) {
      status = 'hidden';
      reasons.push({ owner, conditional, result: 'hidden' });
    }
  }
  return { status, reasons };
};

const compareOrder = (left, right) => {
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const difference = (left[index] ?? -1) - (right[index] ?? -1);
    if (difference !== 0) {
      return difference;
    }
  }
  return 0;
};

const orderKey = (node, rows) => {
  const datagrids = getDatagridAncestors(node);
  const key = [];
  let rowIndex = 0;
  node.position.forEach((value, depth) => {
    key.push(value);
    const datagrid = datagrids[rowIndex];
    if (datagrid && datagrid.position.length === depth + 1) {
      key.push(rows[rowIndex] ?? 0);
      rowIndex += 1;
    }
  });
  return key;
};

const nodeName = (node, rows = []) =>
  node.path && (node.isFillable || groupTypes.has(node.type))
    ? `"${node.label}" (${concretePath(node, rows)})`
    : `${node.type} "${node.label}"`;
const pageName = (page) => `"${page.title}"`;

const resolveFill = (model, fill) => {
  const rawPath = (fill.path ?? fill.key ?? '').trim();
  if (!rawPath) {
    return { error: 'fill entry needs a path' };
  }
  const { template, rows } = parsePath(rawPath);
  let resolved = resolveTemplatePath(model, template);
  if (!resolved && !template.includes('.')) {
    const candidates = (model.byKey.get(template) ?? []).filter((node) => node.isFillable);
    if (candidates.length > 1) {
      return {
        error: `"${rawPath}" matches several fields (${candidates.map((node) => node.path).join(', ')}); use the full data path`,
      };
    }
    resolved = candidates[0] && { node: candidates[0], subPath: '' };
  }
  if (!resolved) {
    return { error: `"${rawPath}" does not match a field in the form` };
  }
  if (!resolved.node.isFillable) {
    return { error: `"${rawPath}" is a ${resolved.node.type} group, not a field to fill` };
  }
  return { node: resolved.node, subPath: resolved.subPath, rows, rawPath };
};

const checkFillSequence = (model, { fills = [], assume = {}, leaveEmpty = [], reachesSummary = false } = {}) => {
  const errors = [];
  const warnings = [];
  const data = {};
  const steps = [];
  const resolvedFills = fills.map((fill) => ({ fill, ...resolveFill(model, fill) }));

  resolvedFills.forEach((entry, index) => {
    if (entry.error) {
      errors.push(`Fill ${index + 1}: ${entry.error}.`);
    }
  });
  if (errors.length) {
    return { errors, warnings, steps };
  }

  const indexOfPath = (node, rows, from) =>
    resolvedFills.findIndex(
      (entry, index) => index >= from && concretePath(entry.node, entry.rows) === concretePath(node, rows),
    );

  let previous;
  resolvedFills.forEach((entry, index) => {
    const { node, rows, subPath, fill } = entry;
    const label = `Fill ${index + 1} ${nodeName(node, rows)}`;
    const step = { index: index + 1, node, rows, fill, page: node.page };

    for (const conditional of getConditionals(model, node)) {
      for (const dependency of conditional.dependencies ?? []) {
        if (!dependency.resolved) {
          if (conditional.kind === 'simple') {
            warnings.push(`${label}: conditional field "${dependency.path}" was not found in the form.`);
          }
          continue;
        }
        const dependencyRows = rows.slice(0, getDatagridAncestors(dependency.resolved.node).length);
        const laterIndex = indexOfPath(dependency.resolved.node, dependencyRows, index + 1);
        const earlierIndex = resolvedFills.findIndex(
          (other, otherIndex) =>
            otherIndex < index &&
            concretePath(other.node, other.rows) === concretePath(dependency.resolved.node, dependencyRows),
        );
        if (laterIndex !== -1 && earlierIndex === -1) {
          const subject =
            conditional.owner === node ? 'its visibility' : `visibility of ${nodeName(conditional.owner, rows)}`;
          errors.push(
            `${label}: ${subject} depends on ${nodeName(dependency.resolved.node, dependencyRows)}, which is filled later (fill ${laterIndex + 1}). Fill the controlling field first.`,
          );
        }
      }
    }

    if (!fill.prefilled) {
      const visibility = evaluateVisibility(model, node, rows, data, assume);
      if (visibility.status === 'hidden') {
        const reason = visibility.reasons.find((item) => item.result === 'hidden');
        errors.push(
          `${label} is not shown at this point: ${nodeName(reason.owner, rows)} has "${describeConditional(reason.conditional)}".`,
        );
      } else if (visibility.status === 'unknown') {
        for (const reason of visibility.reasons) {
          errors.push(
            `${label}: ${nodeName(reason.owner, rows)} has a custom conditional that is not evaluated: ${reason.conditional.expression}. Read it, then add assume["${concretePath(reason.owner, rows)}"]: true or false.`,
          );
        }
      }

      const currentOrder = orderKey(node, rows);
      if (previous && compareOrder(currentOrder, previous.order) <= 0 && !fill.revisit) {
        const samePage = previous.node.page === node.page;
        errors.push(
          samePage
            ? `${label} is above ${nodeName(previous.node, previous.rows)} on page ${pageName(node.page)}. Reorder the fills, or set "revisit": true if the tester deliberately goes back.`
            : `${label} is on page ${pageName(node.page)}, before page ${pageName(previous.node.page)} of the previous fill. Reorder the fills, or set "revisit": true if the tester deliberately goes back.`,
        );
      }
      previous = { node, rows, order: currentOrder };
    }

    const before = resolvedFills.slice(0, index).map((other) => ({
      other,
      visible: evaluateVisibility(model, other.node, other.rows, data, assume).status !== 'hidden',
    }));
    setByPath(data, concretePath(node, rows, subPath), fill.value);
    for (const { other, visible } of before) {
      if (!visible || concretePath(other.node, other.rows) === concretePath(node, rows)) {
        continue;
      }
      if (evaluateVisibility(model, other.node, other.rows, data, assume).status === 'hidden') {
        const cleared = other.node.component.clearOnHide !== false;
        warnings.push(
          `${label} hides the earlier filled ${nodeName(other.node, other.rows)}${cleared ? ', which clears its value' : ''}.`,
        );
        if (cleared) {
          deleteByPath(data, concretePath(other.node, other.rows, other.subPath));
        }
      }
    }
    steps.push(step);
  });

  const lastPageIndex = reachesSummary
    ? model.pages.length - 1
    : Math.max(...resolvedFills.map((entry) => entry.node.page.index), -1);
  const lastOrder = resolvedFills
    .filter((entry) => !entry.fill.prefilled)
    .map((entry) => orderKey(entry.node, entry.rows))
    .reduce((latest, order) => (!latest || compareOrder(order, latest) > 0 ? order : latest), undefined);
  const filledPaths = new Set(resolvedFills.map((entry) => concretePath(entry.node, entry.rows)));
  const leftEmpty = new Set(leaveEmpty);
  const maxRows = new Map();
  for (const entry of resolvedFills) {
    getDatagridAncestors(entry.node).forEach((datagrid, index) => {
      maxRows.set(datagrid, Math.max(maxRows.get(datagrid) ?? 0, entry.rows[index] ?? 0));
    });
  }
  const rowCombinations = (node) =>
    getDatagridAncestors(node).reduce(
      (combinations, datagrid) =>
        combinations.flatMap((rows) =>
          Array.from({ length: (maxRows.get(datagrid) ?? 0) + 1 }, (_, row) => [...rows, row]),
        ),
      [[]],
    );

  const pagesVisited = [];
  for (const page of model.pages.slice(0, lastPageIndex + 1)) {
    const pageVisibility = page.node ? evaluateVisibility(model, page.node, [], data, assume) : { status: 'visible' };
    if (pageVisibility.status === 'hidden') {
      continue;
    }
    pagesVisited.push({ page, uncertain: pageVisibility.status === 'unknown' });
    for (const node of model.nodes.filter((candidate) => candidate.page === page && candidate.isFillable)) {
      if (!node.required) {
        continue;
      }
      for (const rows of rowCombinations(node)) {
        const path = concretePath(node, rows);
        const afterLastFill = !reachesSummary && lastOrder && compareOrder(orderKey(node, rows), lastOrder) > 0;
        if (
          afterLastFill ||
          filledPaths.has(path) ||
          [path, node.path, node.key].some((candidate) => leftEmpty.has(candidate)) ||
          !isEmpty(getByPath(data, path))
        ) {
          continue;
        }
        const visibility = evaluateVisibility(model, node, rows, data, assume);
        if (visibility.status === 'visible') {
          errors.push(
            `Required field ${nodeName(node, rows)} on page ${pageName(page)} is shown but not filled. Add a fill, a fill with "prefilled": true if the application fills it, or list it in "leaveEmpty" if the case leaves it empty on purpose.`,
          );
        } else if (visibility.status === 'unknown') {
          warnings.push(
            `Required field ${nodeName(node, rows)} on page ${pageName(page)} may be shown, depending on a custom conditional without an assumption.`,
          );
        }
      }
    }
  }

  return { errors, warnings, steps, pagesVisited };
};

const isListed = (node) => node.isFillable || groupTypes.has(node.type) || layoutTypes.has(node.type);

const describeForm = (model) =>
  model.pages.map((page) => ({
    page,
    conditionals: page.node ? getConditionals(model, page.node).filter((item) => item.owner === page.node) : [],
    fields: model.nodes
      .filter((node) => node.page === page && node !== page.node && isListed(node))
      .map((node) => ({
        node,
        depth: getAncestors(node).filter((ancestor) => ancestor !== page.node && isListed(ancestor)).length,
        conditionals: getConditionals(model, node).filter((item) => item.owner === node),
      })),
  }));

export {
  buildModel,
  checkFillSequence,
  concretePath,
  describeConditional,
  describeForm,
  extractCustomReferences,
  groupTypes,
};
