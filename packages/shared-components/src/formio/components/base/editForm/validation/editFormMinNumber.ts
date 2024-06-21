import { Component } from '@navikt/skjemadigitalisering-shared-domain';

interface Options {
  label?: string;
}

const editFormMinNumber = (options?: Options): Component => {
  const label = options?.label ?? 'Minimum';

  return {
    type: 'number',
    label,
    key: 'validate.min',
  };
};

export default editFormMinNumber;
