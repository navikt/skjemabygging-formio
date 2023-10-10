import { NavFormType, ReportDefinition } from '@navikt/skjemadigitalisering-shared-domain';
import { stringify } from 'csv-stringify';
import { DateTime } from 'luxon';
import { Writable } from 'stream';
import { FormioService } from './formioService';

const ReportMap: Record<string, ReportDefinition> = {
  FORMS_PUBLISHED_LANGUAGES: {
    id: 'forms-published-languages',
    title: 'Publiserte språk per skjema',
    contentType: 'text/csv',
    fileEnding: 'csv',
  },
  ALL_FORMS_SUMMARY: {
    id: 'all-forms-summary',
    title: 'Alle skjema med nøkkelinformasjon',
    contentType: 'text/csv',
    fileEnding: 'csv',
  },
  UNPUBLISHED_FORMS: {
    id: 'unpublished-forms',
    title: 'Avpubliserte skjema',
    contentType: 'text/csv',
    fileEnding: 'csv',
  },
};

const notTestForm = (form: NavFormType) => !form.properties.isTestForm;

class ReportService {
  private readonly formioService: FormioService;

  constructor(formioService: FormioService) {
    this.formioService = formioService;
  }

  async generate(reportId: string, writableStream: Writable) {
    switch (reportId) {
      case ReportMap.FORMS_PUBLISHED_LANGUAGES.id:
        return this.generateFormsPublishedLanguage(writableStream);
      case ReportMap.ALL_FORMS_SUMMARY.id:
        return this.generateAllFormsSummary(writableStream);
      case ReportMap.UNPUBLISHED_FORMS.id:
        return this.generateUnpublishedForms(writableStream);
      default:
        throw new Error(`Report not implemented: ${reportId}`);
    }
  }

  getReportDefinition = (reportId: string) => Object.values(ReportMap).find((report) => report.id === reportId);

  getAllReports(): ReportDefinition[] {
    return Object.keys(ReportMap).map((key) => ({ ...ReportMap[key] }));
  }

  private async generateFormsPublishedLanguage(writableStream: Writable) {
    const columns = ['skjemanummer', 'skjematittel', 'språk'];
    const publishedForms = await this.formioService.getPublishedForms('title,properties');
    const stringifier = stringify({ header: true, columns, delimiter: ';' });
    stringifier.pipe(writableStream);
    publishedForms.filter(notTestForm).forEach((form) => {
      const { title, properties } = form;
      const publishedLanguages = properties.publishedLanguages?.join(',') || '';
      stringifier.write([properties.skjemanummer, title, publishedLanguages]);
    });
    stringifier.end();
  }

  private async generateAllFormsSummary(writableStream: Writable) {
    const columns = [
      'skjemanummer',
      'skjematittel',
      'tema',
      'sist publisert',
      'publisert av',
      'upubliserte endringer',
      'sist endret',
      'endret av',
      'innsending',
      'signaturfelt',
      'path',
      'har vedlegg',
      'antall vedlegg',
      'vedleggsnavn',
    ];
    const allForms = await this.formioService.getAllForms(undefined, true, 'title,path,properties,components');
    const stringifier = stringify({ header: true, columns, delimiter: ';' });
    stringifier.pipe(writableStream);
    allForms.filter(notTestForm).forEach((form) => {
      const hasAttachment = this.hasAttachment(form);
      const attachmentTitles = this.getAttachmentTitles(form);
      const numberOfAttachments = attachmentTitles.length;
      const joinedAttachmentNames = attachmentTitles.join(',');

      const { title, properties, path } = form;
      const { published, publishedBy, modified, modifiedBy, innsending, tema, signatures } = properties;
      let unpublishedChanges: string = '';
      if (modified && published) {
        const modifiedDate = DateTime.fromISO(modified);
        const publishedDate = DateTime.fromISO(published);
        unpublishedChanges = publishedDate.until(modifiedDate).isEmpty() ? 'nei' : 'ja';
      }
      const numberOfSignatures = signatures?.length || 1;
      stringifier.write([
        properties.skjemanummer,
        title,
        tema,
        published,
        publishedBy,
        unpublishedChanges,
        modified,
        modifiedBy,
        innsending,
        numberOfSignatures,
        path,
        hasAttachment ? 'ja' : 'nei',
        numberOfAttachments,
        joinedAttachmentNames,
      ]);
    });
    stringifier.end();
  }

  private getAttachmentPanel(form: NavFormType) {
    return form.components.find((component) => component.isAttachmentPanel);
  }

  private hasAttachment(form: NavFormType) {
    const attachmentPanel = this.getAttachmentPanel(form);
    return !!attachmentPanel?.components?.length;
  }

  private getAttachmentTitles(form: NavFormType): string[] {
    const attachmentPanel = this.getAttachmentPanel(form);
    if (!attachmentPanel || !attachmentPanel.components) return [];

    const attachmentTitles = attachmentPanel.components.map((component) => component.properties?.vedleggstittel);
    return attachmentTitles.filter((x): x is string => x !== undefined);
  }

  private async generateUnpublishedForms(writableStream: Writable) {
    const columns = ['skjemanummer', 'skjematittel', 'avpublisert', 'avpublisert av'];
    const publishedForms = await this.formioService.getUnpublishedForms('title,properties');
    const stringifier = stringify({ header: true, columns, delimiter: ';' });
    stringifier.pipe(writableStream);
    publishedForms.filter(notTestForm).forEach((form) => {
      const { title, properties } = form;
      const { unpublished, unpublishedBy } = properties;
      stringifier.write([properties.skjemanummer, title, unpublished, unpublishedBy]);
    });
    stringifier.end();
  }
}

export default ReportService;
