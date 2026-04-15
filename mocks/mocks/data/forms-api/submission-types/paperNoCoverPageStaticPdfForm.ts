import { attachment, panel, textField } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const paperNoCoverPageStaticPdfForm = () => {
  const formNumber = 'papernocoverpagestaticpdf';

  return form({
    title: 'Submission Type: Static PDF and Paper No Cover Page',
    formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Dine opplysninger',
        components: [
          textField({ label: 'Tekstfelt' }),
          attachment({ key: 'vedlegg1', label: 'Vedlegg 1', description: 'Beskrivelse 1' }),
        ],
      }),
    ],
    properties: formProperties({
      formNumber,
      submissionTypes: ['STATIC_PDF', 'PAPER_NO_COVER_PAGE'],
    }),
  });
};

const staticPdfPaperNoCoverPageTranslations = () => getMockTranslationsFromForm(paperNoCoverPageStaticPdfForm());

export { paperNoCoverPageStaticPdfForm, staticPdfPaperNoCoverPageTranslations };
