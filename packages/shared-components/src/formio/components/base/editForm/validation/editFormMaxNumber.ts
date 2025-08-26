import { Component } from '@navikt/skjemadigitalisering-shared-domain';

interface Options {
  label?: string;
}

const editFormMaxNumber = (options?: Options): Component => {
  const label = options?.label ?? 'Maksimum';

  return {
    type: 'number',
    label,
    key: 'validate.max',
    input: true,
  };
};

export default editFormMaxNumber;
