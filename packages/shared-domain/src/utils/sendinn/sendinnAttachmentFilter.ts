const normalizeSendinnAttachmentFilter = (filter?: string | readonly string[]): string[] =>
  (typeof filter === 'string' ? filter : (filter ?? []).join(','))
    .split(',')
    .map((code) => code.trim())
    .filter((code) => code.length > 0);

export { normalizeSendinnAttachmentFilter };
