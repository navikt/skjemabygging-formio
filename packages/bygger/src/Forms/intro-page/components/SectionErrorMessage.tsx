import { ExclamationmarkTriangleFillIcon } from '@navikt/aksel-icons';
import { BodyShort } from '@navikt/ds-react';

type Props = {
  errorMessage?: string;
};

export function SectionErrorMessage({ errorMessage }: Props) {
  return (
    errorMessage && (
      <div>
        <BodyShort
          weight="semibold"
          style={{
            display: 'flex',
            gap: 'var(--a-space-4)',
            color: 'var(--a-red-500)',
            marginTop: '.25rem',
            height: '1rem',
          }}
        >
          <ExclamationmarkTriangleFillIcon
            title="a11y-title"
            fontSize="1.2rem"
            style={{
              marginTop: '0.15em',
              flex: '0 0 auto',
              height: '100%',
            }}
          />
          {errorMessage}
        </BodyShort>
      </div>
    )
  );
}
