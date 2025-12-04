import { TElement, Tkey, TranslateFunction } from '@navikt/skjemadigitalisering-shared-domain';

export const tElement = (key: Tkey, params: Record<string, any>): TElement => ({ key, params });

export const tElementTranslator = (translate: TranslateFunction) => (element: TElement) =>
  typeof element === 'string' ? translate(element) : translate(element.key, element.params);
