import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const isVisibleComponent = (component: Component) => !component.hidden || component.type === 'maalgruppe';

export { isVisibleComponent };
