import { ExclamationmarkTriangleFillIcon } from '@navikt/aksel-icons';

interface Props {
  title?: string;
}

const iconStyle = {
  verticalAlign: 'sub',
  fontSize: '1.5rem',
  color: 'var(--ax-warning-700)',
  margin: '0 var(--ax-space-4)',
} as const;

const ValidationExclamationIcon = ({ title }: Props) => {
  return <ExclamationmarkTriangleFillIcon style={iconStyle} title={title} aria-hidden={!title} />;
};

export default ValidationExclamationIcon;
