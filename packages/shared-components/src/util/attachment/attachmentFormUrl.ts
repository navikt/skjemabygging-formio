const paperNoCoverPageQuery = 'sub=papernocoverpage';

const createAttachmentFormUrl = (fyllutBaseURL: string | undefined, formPath: string) => {
  const baseUrl = fyllutBaseURL?.replace(/\/$/, '') ?? '';
  const normalizedFormPath = formPath.replace(/^\//, '');

  return `${baseUrl}/${normalizedFormPath}?${paperNoCoverPageQuery}`;
};

export { createAttachmentFormUrl };
