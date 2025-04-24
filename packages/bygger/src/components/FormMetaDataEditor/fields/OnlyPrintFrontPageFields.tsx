import { Checkbox } from '@navikt/ds-react';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { UpdateFormFunction } from '../utils/utils';

export interface OnlyPrintFrontPageFieldsProps {
  onChange: UpdateFormFunction;
  form: Form;
}

const OnlyPrintFrontPageFields = ({ onChange, form }: OnlyPrintFrontPageFieldsProps) => {
  const { printOnlyFrontpage } = form.properties;
  const isLockedForm = !!form.lock;

  return (
    <>
      <Checkbox
        className="mb"
        checked={printOnlyFrontpage}
        readOnly={isLockedForm}
        onChange={(event) =>
          onChange({
            ...form,
            properties: { ...form.properties, hideUserTypes: event.target.checked },
          })
        }
      >
        {'Skriv ut kun førstesiden ved innsending på papir for dette skjema'}
      </Checkbox>
    </>
  );
};

export default OnlyPrintFrontPageFields;
