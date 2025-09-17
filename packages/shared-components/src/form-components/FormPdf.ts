/*
import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { PdfPanel } from './components/group';
import { PdfTextField } from './components/standard';
import renderPdf from './render/RenderPdf';

interface Props {
  components: Component[];
}

const formPdf = ({ components }: Props) => {
  const componentRegistry = {
    textfield: PdfTextField,
    panel: PdfPanel,
  };

  return components.map((component) =>
    renderPdf({
      component,
      submissionPath: '',
      componentRegistry,
    }),
  );
};

export default formPdf;
*/
