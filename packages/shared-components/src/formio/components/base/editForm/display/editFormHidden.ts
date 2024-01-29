import { Component } from '@navikt/skjemadigitalisering-shared-domain';

/**
 * This component is hidden for the user and sets the hidden property on the parent component.
 * Can be used to hide the parent component based on a different data.<key>.
 *
 * Example calculateValue: value = data.<key> === "<value>"
 *
 * @param calculateValue
 */
const editFormHidden = (calculateValue: string): Component => {
  return {
    type: 'hidden',
    label: '',
    key: 'hidden',
    defaultValue: true,
    calculateValue,
  };
};

export default editFormHidden;
