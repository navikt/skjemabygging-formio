import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { readFileSync } from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), '/src/routers/api/helpers/footer-template.html');

export function generateFooterHtml(userId, schemaVersion, skjemanummer, language, translate: (text: string) => string) {
  let footerHtml = readFileSync(filePath, { encoding: 'utf-8', flag: 'r' });

  const creationDate = new Date().toLocaleString();

  footerHtml = footerHtml
    .replace('{{USER_ID}}', userId)
    .replace('{{CREATION_DATE}}', creationDate)
    .replace('{{SCHEMA_VERSION}}', schemaVersion)
    .replace('{{SCHEMA_NUMBER}}', skjemanummer)
    .replace('{{userIdLabel}}', translate(TEXTS.statiske.footer.userIdLabel))
    .replace('{{createdLabel}}', translate(TEXTS.statiske.footer.createdDatelabel))
    .replace('{{schemaNumberLabel}}', translate(TEXTS.statiske.footer.schemaNumberLabel))
    .replace('{{versionLabel}}', translate(TEXTS.statiske.footer.versionLabel))
    .replace('{{pageLabel}}', translate(TEXTS.statiske.footer.pageLabel))
    .replace('{{ofLabel}}', translate(TEXTS.statiske.footer.ofLabel));

  return footerHtml;
}
