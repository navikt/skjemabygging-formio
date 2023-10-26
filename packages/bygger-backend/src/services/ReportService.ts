import { NavFormType, ReportDefinition, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { stringify } from 'csv-stringify';
import { DateTime } from 'luxon';
import { Writable } from 'stream';
import config from '../config';
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
  ALL_FORMS_AND_ATTACHMENTS: {
    id: 'all-forms-and-attachments',
    title: 'Alle skjema med vedlegg',
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
      case ReportMap.ALL_FORMS_AND_ATTACHMENTS.id:
        return this.generateAllFormsAndAttachments(writableStream);
      default:
        throw new Error(`Report not implemented: ${reportId}`);
    }
  }

  getReportDefinition = (reportId: string) => Object.values(ReportMap).find((report) => report.id === reportId);

  getAllReports(): ReportDefinition[] {
    return Object.keys(ReportMap).map((key) => ({ ...ReportMap[key] }));
  }

  private async generateAllFormsAndAttachments(writableStream: Writable) {
    const columns = ['skjemanummer', 'skjematittel', 'vedleggstittel', 'vedleggskode', 'label'];
    const allForms = await this.formioService.getAllForms(
      undefined,
      true,
      'title,path,properties,components.type,components.isAttachmentPanel,components.components.properties,components.components.label',
    );
    const stringifier = stringify({ header: true, columns, delimiter: ';' });
    stringifier.pipe(writableStream);
    allForms.filter(notTestForm).forEach((form) => {
      const attachments = navFormUtils.getAttachmentProperties(form);

      const { title, properties } = form;

      attachments.forEach((attachment) => {
        stringifier.write([
          properties.skjemanummer,
          title,
          attachment.vedleggstittel,
          attachment.vedleggskode,
          attachment?.label,
        ]);
      });
    });
    stringifier.end();
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
      'ettersending',
      'signaturfelt',
      'path',
      'har vedlegg',
      'antall vedlegg',
      'vedleggsnavn',
      'innsending (digital)',
      'innsending (papir)',
      'ettersending (digital)',
      'ettersending (papir)',
    ];
    const allForms = await this.formioService.getAllForms(
      undefined,
      true,
      'title,path,properties,components.type,components.isAttachmentPanel,components.components.properties',
    );
    const stringifier = stringify({ header: true, columns, delimiter: ';' });
    stringifier.pipe(writableStream);
    allForms.filter(notTestForm).forEach((form) => {
      const hasAttachment = navFormUtils.hasAttachment(form);
      const attachments = navFormUtils.getAttachmentProperties(form);
      const numberOfAttachments = attachments.length;
      const attachmentNames = attachments.map((attachment) => attachment.vedleggstittel).join(',');

      const { title, properties, path } = form;
      const { published, publishedBy, modified, modifiedBy, innsending, tema, signatures, ettersending } = properties;

      const innsendingUrl =
        config.naisClusterName === 'prod-gcp'
          ? `https://www.nav.no/fyllut/${form.path}`
          : `https://fyllut-preprod.intern.dev.nav.no/fyllut/${form.path}`;
      const ettersendingUrl =
        config.naisClusterName === 'prod-gcp'
          ? `https://www.nav.no/fyllut-ettersending/detaljer/${form.path}`
          : `https://fyllut-ettersending.intern.dev.nav.no/fyllut-ettersending/detaljer/${form.path}`;

      const digitalInnsendingUrl = navFormUtils.isDigital('innsending', form)
        ? `${innsendingUrl}?sub=digital`
        : undefined;
      const paperInnsendingUrl = navFormUtils.isPaper('innsending', form) ? `${innsendingUrl}?sub=paper` : undefined;

      const digitalEttersendingUrl =
        navFormUtils.isDigital('ettersending', form) && hasAttachment ? `${ettersendingUrl}?sub=digital` : undefined;
      const paperEttersendingUrl =
        navFormUtils.isPaper('ettersending', form) && hasAttachment ? `${ettersendingUrl}?sub=paper` : undefined;

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
        ettersending || 'PAPIR_OG_DIGITAL',
        numberOfSignatures,
        path,
        hasAttachment ? 'ja' : 'nei',
        numberOfAttachments,
        attachmentNames,
        digitalInnsendingUrl || '',
        paperInnsendingUrl || '',
        digitalEttersendingUrl || '',
        paperEttersendingUrl || '',
      ]);
    });
    stringifier.end();
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
