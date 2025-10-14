import { PdfComponentProps, PdfListElement } from '../types';

const renderPdfComponent = (props: PdfComponentProps): PdfListElement => {
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
