import { ErrorPageWrapper } from './ErrorPageWrapper';
import { FormNotFoundContent } from './content/FormNotFoundContent';

export function FormNotFoundPage() {
  return (
    <ErrorPageWrapper>
      <FormNotFoundContent />
    </ErrorPageWrapper>
  );
}
