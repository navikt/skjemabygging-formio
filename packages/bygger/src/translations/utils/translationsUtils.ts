import { FormsApiTranslation } from '@navikt/skjemadigitalisering-shared-domain';

const removeDuplicatesAfterFirstMatch = ({ key }, index: number, all: FormsApiTranslation[]) =>
  !key || index === all.findIndex((translation) => translation.key === key);

const getInputHeightInRows = (value?: string, rowSizeInCharacters: number = 30): number => {
  return Math.floor((value ?? '').length / rowSizeInCharacters) + 1;
};

export { getInputHeightInRows, removeDuplicatesAfterFirstMatch };
