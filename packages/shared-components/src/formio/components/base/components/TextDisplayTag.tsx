import { Tag } from '@navikt/ds-react';
import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { useComponentUtils } from '../../../../context/component/componentUtilsContext';

interface Props {
  component?: Component;
}

const TextDisplayTag = ({ component }: Props) => {
  const { builderMode } = useComponentUtils();

  if (!builderMode) {
    return <></>;
  }

  if (component?.textDisplay === 'pdf') {
    return (
      <Tag data-color="info" variant="outline" className="mb-4" size="xsmall">
        PDF
      </Tag>
    );
  } else if (component?.textDisplay === 'formPdf') {
    return (
      <Tag data-color="info" variant="outline" className="mb-4" size="xsmall">
        Skjema og PDF
      </Tag>
    );
  }
};

export default TextDisplayTag;
