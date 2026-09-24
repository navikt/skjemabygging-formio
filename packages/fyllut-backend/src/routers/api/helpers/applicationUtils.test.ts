import { Form, Submission, SubmissionSender } from '@navikt/skjemadigitalisering-shared-domain';
import { assembleSubmitApplicationRequest } from './applicationUtils';

describe('assembleSubmitApplicationRequest', () => {
  // Form has no `type: 'sender'` component, only the legacy avsender name
  // fields. The application subject (bruker) is a different person than the
  // sender, i.e. "send på vegne av andre".
  const formWithLegacyAvsenderFields = {
    path: 'nav060404',
    title: 'NAV 06-04.04',
    revision: '1',
    properties: { skjemanummer: 'NAV 06-04.04', tema: 'XXX' },
    components: [
      {
        key: 'yourInfo',
        type: 'container',
        yourInformation: true,
      },
      { key: 'fornavnAvsender', type: 'textfield' },
      { key: 'etternavnAvsender', type: 'textfield' },
    ],
  } as unknown as Form;

  const submissionWithLegacyAvsenderFields = {
    data: {
      yourInfo: { identitet: { identitetsnummer: '10987654321' } },
      fornavnAvsender: 'Ola',
      etternavnAvsender: 'Nordmann',
    },
  } as unknown as Submission;

  const assemble = (authenticatedSenderId?: string) =>
    assembleSubmitApplicationRequest(
      'test-innsendingsid',
      formWithLegacyAvsenderFields,
      submissionWithLegacyAvsenderFields,
      'nb',
      [],
      (text: string) => text,
      authenticatedSenderId,
    );

  // Ticket: "Avsender id skal være med når dette er tilgjengelig".
  // The archive requires avsender.id for logged-in senders (channel NAV_NO).
  it('sets avsender id, not only avsender navn, when the sender is logged in', () => {
    const result = assemble('12345678911');

    // The application subject and the sender are different people.
    expect(result.bruker).toBe('10987654321');
    expect(result.avsender).toEqual({
      id: '12345678911',
      idType: 'FNR',
      navn: 'Ola Nordmann',
    });
  });

  it('sets only avsender navn when the sender is not logged in', () => {
    const result = assemble(undefined);

    expect(result.bruker).toBe('10987654321');
    expect(result.avsender).toEqual({ navn: 'Ola Nordmann' });
  });

  // A form using the sender component states who the sender is. The
  // authenticated identity must never override that, or a submission would be
  // attributed to whoever happened to be logged in rather than to the stated
  // sender. These forms also carry the legacy fields here, so the assertions
  // pin precedence over both fallbacks at once.
  describe('when the form uses the sender component', () => {
    const formWithSenderComponent = {
      ...formWithLegacyAvsenderFields,
      components: [
        ...(formWithLegacyAvsenderFields.components ?? []),
        { key: 'avsenderPerson', type: 'sender', input: true },
      ],
    } as unknown as Form;

    const assembleWithSender = (sender: SubmissionSender) =>
      assembleSubmitApplicationRequest(
        'test-innsendingsid',
        formWithSenderComponent,
        {
          data: { ...submissionWithLegacyAvsenderFields.data, avsenderPerson: sender },
        } as unknown as Submission,
        'nb',
        [],
        (text: string) => text,
        '12345678911',
      );

    it('keeps the person stated by the component instead of the logged-in identity', () => {
      const result = assembleWithSender({
        person: { nationalIdentityNumber: '11223344556', firstName: 'Kari', surname: 'Hansen' },
      });

      expect(result.avsender).toEqual({
        id: '11223344556',
        idType: 'FNR',
        navn: 'Kari Hansen',
      });
    });

    it('keeps the organization stated by the component instead of the logged-in identity', () => {
      const result = assembleWithSender({
        organization: { number: '987654321', name: 'Arbeidsgiver AS' },
      });

      expect(result.avsender).toEqual({
        id: '987654321',
        idType: 'ORGNR',
        navn: 'Arbeidsgiver AS',
      });
    });
  });
});
