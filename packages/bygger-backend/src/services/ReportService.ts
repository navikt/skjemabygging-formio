import { Form, ReportDefinition, formioFormsApiUtils, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { stringify } from 'csv-stringify';
import { Writable } from 'stream';
import config from '../config';
import { FormPublicationsService } from './formPublications/types';
import { FormsService } from './forms/types';

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

const notTestForm = (form: Form) => !form.properties.isTestForm;

class ReportService {
  private readonly formsService: FormsService;
  private readonly formPublicationsService: FormPublicationsService;

  constructor(formsService: FormsService, formPublicationsService: FormPublicationsService) {
    this.formsService = formsService;
    this.formPublicationsService = formPublicationsService;
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
    const allFormsCompact = (await this.formsService.getAll('title,skjemanummer,properties')).filter(notTestForm);
    const stringifier = stringify({ header: true, columns, delimiter: ';' });
    stringifier.pipe(writableStream);
    for (const formCompact of allFormsCompact) {
      const formsApiForm = await this.formsService.get(formCompact.path);
      const form = formioFormsApiUtils.mapFormToNavForm(formsApiForm);
      const attachments = navFormUtils.getAttachmentProperties(form);

      const { title, skjemanummer } = formCompact;

      attachments.forEach((attachment) => {
        stringifier.write([skjemanummer, title, attachment.vedleggstittel, attachment.vedleggskode, attachment?.label]);
      });
    }
    stringifier.end();
  }

  private async generateFormsPublishedLanguage(writableStream: Writable) {
    const columns = ['skjemanummer', 'skjematittel', 'språk'];
    const publishedForms = await this.formPublicationsService.getAll();

    const stringifier = stringify({ header: true, columns, delimiter: ';' });
    stringifier.pipe(writableStream);
    const publicForms: Form[] = publishedForms.filter(notTestForm);
    for (const form of publicForms) {
      const { title, path, skjemanummer } = form;
      const translationPublication = await this.formPublicationsService.getTranslations(path, ['nb', 'nn', 'en']);
      const publishedLanguages = Object.keys(translationPublication.translations);
      stringifier.write([skjemanummer, title, publishedLanguages.join(',') || '']);
    }
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
      'innsendingsurl',
      'innsendingsurl (papir)',
      'ettersendingsurl',
      'ettersendingsurl (papir)',
    ];
    const allFormsCompact = (
      await this.formsService.getAll('title,path,properties,status,changedAt,changedBy,publishedAt,publishedBy')
    ).filter(notTestForm);
    const stringifier = stringify({ header: true, columns, delimiter: ';' });
    stringifier.pipe(writableStream);
    for (const formCompact of allFormsCompact) {
      const formsApiForm = await this.formsService.get(formCompact.path);
      const form = formioFormsApiUtils.mapFormToNavForm(formsApiForm);
      const hasAttachment = navFormUtils.hasAttachment(form);
      const attachments = navFormUtils.getAttachmentProperties(form);
      const numberOfAttachments = attachments.length;
      const attachmentNames = attachments.map((attachment) => attachment.vedleggstittel).join(',');

      const { title, path, properties, status, changedAt, changedBy, publishedAt, publishedBy } = formCompact;
      const { innsending, tema, signatures, ettersending } = properties;

      const baseInnsendingUrl =
        config.naisClusterName === 'prod-gcp'
          ? `https://www.nav.no/fyllut/${form.path}`
          : `https://fyllut-preprod.intern.dev.nav.no/fyllut/${form.path}`;
      const baseEttersendingUrl =
        config.naisClusterName === 'prod-gcp'
          ? `https://www.nav.no/fyllut-ettersending/${form.path}`
          : `https://fyllut-ettersending.intern.dev.nav.no/fyllut-ettersending/${form.path}`;

      const paperInnsendingUrl = navFormUtils.isNone('innsending', form)
        ? `${baseInnsendingUrl}`
        : navFormUtils.isPaper('innsending', form)
          ? `${baseInnsendingUrl}?sub=paper`
          : undefined;

      const ettersendingUrl = hasAttachment ? baseEttersendingUrl : undefined;
      const paperEttersendingUrl =
        navFormUtils.isPaper('ettersending', form) && hasAttachment ? `${baseEttersendingUrl}?sub=paper` : undefined;

      const isPublished = ['published', 'pending'].includes(status!);

      let unpublishedChanges = '';
      if (status === 'pending') {
        unpublishedChanges = 'ja';
      } else if (status === 'published') {
        unpublishedChanges = 'nei';
      }
      const numberOfSignatures = signatures?.length || 1;
      stringifier.write([
        properties.skjemanummer,
        title,
        tema,
        isPublished ? publishedAt : undefined,
        isPublished ? publishedBy : undefined,
        unpublishedChanges,
        changedAt,
        changedBy,
        innsending,
        ettersending,
        numberOfSignatures,
        path,
        hasAttachment ? 'ja' : 'nei',
        numberOfAttachments,
        attachmentNames,
        baseInnsendingUrl || '',
        paperInnsendingUrl || '',
        ettersendingUrl || '',
        paperEttersendingUrl || '',
      ]);
    }
    stringifier.end();
  }

  private async generateUnpublishedForms(writableStream: Writable) {
    const columns = ['skjemanummer', 'skjematittel', 'avpublisert', 'avpublisert av'];
    const allFormsCompact = await this.formsService.getAll(
      'skjemanummer,title,status,publishedAt,publishedBy,properties',
    );
    const unpublishedForms = allFormsCompact.filter(
      (form) => !form.properties.isTestForm && form.status === 'unpublished',
    );
    const stringifier = stringify({ header: true, columns, delimiter: ';' });
    stringifier.pipe(writableStream);
    for (const form of unpublishedForms) {
      const { title, skjemanummer, publishedAt, publishedBy } = form;
      stringifier.write([skjemanummer, title, publishedAt, publishedBy]);
    }
    stringifier.end();
  }
}

export default ReportService;
