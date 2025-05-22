import { ErrorPageWrapper } from './ErrorPageWrapper';
import { NotFoundPageContent } from './content/NotFoundPageContent';

export function NotFoundPage() {
  return (
    <ErrorPageWrapper>
      <NotFoundPageContent />
    </ErrorPageWrapper>
  );
}
