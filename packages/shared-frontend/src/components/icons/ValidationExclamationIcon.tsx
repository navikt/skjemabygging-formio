import { ExclamationmarkTriangleFillIcon } from '@navikt/aksel-icons';

interface Props {
  title?: string;
}

const ValidationExclamationIcon = ({ title }: Props) => {
  return (
    <ExclamationmarkTriangleFillIcon
      style={{
        verticalAlign: 'sub',
        fontSize: '1.5rem',
        color: 'var(--ax-warning-700)',
        margin: '0 var(--ax-space-4)',
      }}
      title={title}
      aria-hidden={!title}
    />
  );
};

export default ValidationExclamationIcon;
