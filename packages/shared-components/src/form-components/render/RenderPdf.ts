import { PdfComponentProps } from '../types';

const renderPdf = ({ component, submissionPath, componentRegistry }: PdfComponentProps) => {
  const { type } = component;

  const registryComponent = componentRegistry[type];

  if (!registryComponent) {
    console.warn(`Unsupported component type in pdf: ${type}`);
    return null;
  }

  return {
    ...registryComponent({ component, submissionPath, componentRegistry }),
  };
};

export default renderPdf;
