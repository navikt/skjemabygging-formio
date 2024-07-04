import { NavFormioJs } from '@navikt/skjemadigitalisering-shared-components';
import WebformBuilder from './builder/WebformBuilder';
import WizardBuilder from './builder/WizardBuilder';

// Include BuilderUtils override
import './builder-utils-overrides';

NavFormioJs.Builders.addBuilders({
  wizard: WizardBuilder,
  webform: WebformBuilder,
});
