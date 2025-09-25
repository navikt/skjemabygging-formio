import { PdfComponentProps, PdfData } from '../types';

const renderPdfComponent = ({ component, submissionPath, componentRegistry }: PdfComponentProps): PdfData | null => {
  const { type } = component;

  const registryComponent = componentRegistry[type];

  if (!registryComponent) {
    //console.warn(`Unsupported component type in pdf: ${type}`);
    return null;
  }

  return registryComponent({ component, submissionPath, componentRegistry });
};

export default renderPdfComponent;
