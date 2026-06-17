import { PdfComponentProps } from '../../types';
import PdfOrganizationNumber from './PdfOrganizationNumber';

describe('PdfOrganizationNumber', () => {
  it('removes all spaces from organization number in PDF output', () => {
    const props = {
      component: { label: 'Organisasjonsnummer' },
      submissionPath: 'organizationNumber',
      submission: { data: { organizationNumber: '889 640 782' } },
      translate: (text: string) => text,
    } as unknown as PdfComponentProps;

    expect(PdfOrganizationNumber(props)).toEqual({
      label: 'Organisasjonsnummer',
      verdi: '889640782',
    });
  });
});
