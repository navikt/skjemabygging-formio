import { ErrorPageWrapper } from './ErrorPageWrapper';
import { InternalServerErrorContent } from './content/InternalServerErrorContent';

export function InternalServerErrorPage() {
  return (
    <ErrorPageWrapper>
      <InternalServerErrorContent />
    </ErrorPageWrapper>
  );
}
