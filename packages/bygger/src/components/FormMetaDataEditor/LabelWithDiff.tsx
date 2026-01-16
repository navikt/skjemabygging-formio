import { Tag } from '@navikt/ds-react';
import React from 'react';

export interface LabelWithDiffProps {
  label: React.ReactNode;
  diff: boolean | string;
}

const LabelWithDiff = ({ label, diff = false }: LabelWithDiffProps) => {
  return (
    <div className="label-track-changes">
      <span>{label}</span>
      {diff && (
        <Tag data-color="warning" variant="strong" size="xsmall">
          {typeof diff === 'string' ? `${diff}` : 'Endring'}
        </Tag>
      )}
    </div>
  );
};

export default LabelWithDiff;
