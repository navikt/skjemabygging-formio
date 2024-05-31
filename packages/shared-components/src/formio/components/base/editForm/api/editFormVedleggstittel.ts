import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import editFormApi from './index';

interface PropertyOptions {
  customConditional?: string;
  readOnly?: boolean;
}

const editFormVedleggstittel = (options: PropertyOptions): Component => {
  return {
    ...editFormApi.property({
      label: 'Vedleggstittel',
      key: 'vedleggstittel',
      required: false,
      description: 'Er påkrevd for publisering av skjemaet',
      customConditional: options.customConditional,
      readOnly: options.readOnly,
    }),
    onChange: (props) => {
      props.submission.data.navId = undefined;
    },
  };
};

export default editFormVedleggstittel;
