import { Form } from '@navikt/skjemadigitalisering-shared-domain';

type PdfFooterVersionOptions = {
  envSlug?: string;
  gitSha: string;
  monorepoGitSha: string;
};

const createPdfFooterVersion = (
  form: Pick<Form, 'publicationId' | 'revision' | 'status'>,
  { envSlug = 'dev-local', gitSha, monorepoGitSha }: PdfFooterVersionOptions,
) => {
  const formId =
    form.status === 'published'
      ? form.publicationId || `forms@${gitSha.slice(0, 7)}`
      : form.revision
        ? `rev${form.revision}`
        : `forms@${gitSha.slice(0, 7)}`;

  return `${envSlug ? `${envSlug}/` : ''}${monorepoGitSha.slice(0, 7)}/${formId}`;
};

export { createPdfFooterVersion };
