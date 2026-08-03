import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { applyPrefilledValuesToSubmission } from './prefillSubmission';

describe('applyPrefilledValuesToSubmission', () => {
  it('replaces a resumed identity with prefilled data', () => {
    const form = {
      components: [
        {
          key: 'dineOpplysninger',
          type: 'container',
          input: true,
          tree: true,
          components: [
            {
              key: 'identitet',
              type: 'identity',
              input: true,
              prefillValue: '08842748500',
            },
          ],
        },
      ],
    } as Form;

    const result = applyPrefilledValuesToSubmission(
      form,
      { data: { dineOpplysninger: { identitet: { identitetsnummer: '03876399856' } } } },
      'nb-NO',
    );

    expect(result?.data).toEqual({
      dineOpplysninger: { identitet: { identitetsnummer: '08842748500' } },
    });
  });
});
