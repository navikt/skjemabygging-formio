import { FormPropertiesType, NavFormType, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { Screen } from '@testing-library/react';
import { defaultForm } from '../test-data/form/data';

export const formWithProperties = (
  props: Partial<FormPropertiesType>,
  originalForm: Partial<NavFormType> = defaultForm,
): NavFormType =>
  ({
    ...originalForm,
    properties: {
      ...originalForm.properties,
      ...props,
    },
  }) as unknown as NavFormType;

export type Buttons = {
  redigerSvarKnapp: HTMLButtonElement;
  gaVidereKnapp: HTMLButtonElement;
  sendTilNavKnapp: HTMLButtonElement;
};

export const getButton = (screen: Screen, label: string): HTMLButtonElement =>
  (screen.queryByRole('link', { name: label }) as HTMLButtonElement) ||
  (screen.queryByRole('button', { name: label }) as HTMLButtonElement);

export const getButtons = (screen: Screen): Buttons => {
  const redigerSvarKnapp = getButton(screen, TEXTS.grensesnitt.summaryPage.editAnswers) as HTMLButtonElement;
  const gaVidereKnapp = getButton(screen, TEXTS.grensesnitt.navigation.next) as HTMLButtonElement;
  const sendTilNavKnapp = getButton(screen, TEXTS.grensesnitt.submitToNavPrompt.open) as HTMLButtonElement;
  return { redigerSvarKnapp, gaVidereKnapp, sendTilNavKnapp };
};
