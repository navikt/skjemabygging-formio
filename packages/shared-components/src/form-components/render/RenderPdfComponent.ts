import { PdfComponentProps, PdfListElement } from '../types';

const renderPdfComponent = ({ component, submissionPath, componentRegistry }: PdfComponentProps): PdfListElement => {
  const { type } = component;

  const registryComponent = componentRegistry[type];

  if (!registryComponent) {
    console.warn(`Unsupported component type in pdf: ${type}`);
    return null;
  }

  return registryComponent({ component, submissionPath, componentRegistry });
};

export default renderPdfComponent;
