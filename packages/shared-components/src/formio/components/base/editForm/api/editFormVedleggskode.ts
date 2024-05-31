import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import editFormApi from './index';

interface PropertyOptions {
  customConditional?: string;
  readOnly?: boolean;
}

const editFormVedleggskode = (options: PropertyOptions): Component => {
  return editFormApi.property({
    label: 'Vedleggskode',
    key: 'vedleggskode',
    required: false,
    description: 'Er påkrevd for publisering av skjemaet',
    customConditional: options.customConditional,
    readOnly: options.readOnly,
  });
};

export default editFormVedleggskode;
