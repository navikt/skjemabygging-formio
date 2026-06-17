import { PdfComponentProps } from '../../types';
import PdfSender from './PdfSender';

describe('PdfSender', () => {
  it('removes spaces from organization number in organization sender output', () => {
    const props = {
      component: {
        senderRole: 'organization',
        customLabels: {
          organizationNumber: 'Organisasjonsnummer',
          organizationName: 'Virksomhetens navn',
        },
      },
      submissionPath: 'sender',
      submission: {
        data: {
          sender: {
            organization: {
              number: '889 640 782',
              name: 'NAV Test AS',
            },
          },
        },
      },
      translate: (text: string) => text,
    } as unknown as PdfComponentProps;

    expect(PdfSender(props)).toEqual([
      { label: 'Organisasjonsnummer', verdi: '889640782' },
      { label: 'Virksomhetens navn', verdi: 'NAV Test AS' },
    ]);
  });
});
