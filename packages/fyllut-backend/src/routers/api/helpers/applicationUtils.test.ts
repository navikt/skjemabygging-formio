import { Form, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { assembleSubmitApplicationRequest } from './applicationUtils';

const form = (grantUserDigitalAccess?: boolean): Form =>
  ({
    skjemanummer: 'NAV 12.34-56',
    title: 'Application title',
    path: 'nav123456',
    revision: 1,
    components: [],
    properties: {
      skjemanummer: 'NAV 12.34-56',
      tema: 'BIL',
      submissionTypes: ['DIGITAL'],
      subsequentSubmissionTypes: [],
      ...(grantUserDigitalAccess !== undefined && { grantUserDigitalAccess }),
    },
  }) as Form;

const submission = { data: { fodselsnummerDNummerSoker: '12345678911' } } as Submission;

describe('assembleSubmitApplicationRequest', () => {
  it('includes grantUserDigitalAccess only when the form property is true', () => {
    const request = assembleSubmitApplicationRequest('id', form(true), submission, 'nb', [], (text) => text);

    expect(request).toHaveProperty('grantUserDigitalAccess', true);
  });

  it.each([false, undefined])('omits grantUserDigitalAccess when the form property is %s', (grantUserDigitalAccess) => {
    const request = assembleSubmitApplicationRequest(
      'id',
      form(grantUserDigitalAccess),
      submission,
      'nb',
      [],
      (text) => text,
    );

    expect(request).not.toHaveProperty('grantUserDigitalAccess');
  });
});
