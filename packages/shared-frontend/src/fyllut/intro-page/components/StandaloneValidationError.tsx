import { ExclamationmarkTriangleFillIcon } from '@navikt/aksel-icons';
import { InnerHtml } from './SanitizedHtml';

interface Props {
  children?: string;
}

const StandaloneValidationError = ({ children }: Props) => {
  if (!children) {
    return null;
  }

  return (
    <div style={{ alignItems: 'center', display: 'flex', gap: 'var(--ax-space-4)', margin: 'var(--ax-space-8) 0' }}>
      <ExclamationmarkTriangleFillIcon
        aria-hidden
        fontSize="1rem"
        style={{ color: 'var(--ax-text-danger-decoration)' }}
      />
      <div style={{ color: 'var(--ax-text-danger-subtle)' }}>
        <InnerHtml content={children} className="aksel-label" />
      </div>
    </div>
  );
};

export default StandaloneValidationError;
