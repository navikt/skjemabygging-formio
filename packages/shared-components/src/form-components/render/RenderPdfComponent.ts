import { PdfData } from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps } from '../types';

const renderPdfComponent = (props: PdfComponentProps): PdfData | PdfData[] | null => {
  const { componentRegistry, component } = props;
  const { type } = component;

  const registryComponent = componentRegistry[type];

  if (!registryComponent) {
    console.warn(`Unsupported component type in pdf: ${type}`);
    return null;
  }

  return registryComponent(props);
};

export default renderPdfComponent;
