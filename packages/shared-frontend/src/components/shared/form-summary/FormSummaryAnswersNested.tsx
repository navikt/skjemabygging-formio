import { FormSummary } from '@navikt/ds-react';

interface Props {
  children: React.ReactNode;
}

const FormSummaryAnswersNested = ({ children, ...rest }: Props) => {
  return (
    <FormSummary.Answers style={{ backgroundColor: 'var(--ax-neutral-100)' }} {...rest}>
      {children}
    </FormSummary.Answers>
  );
};

export default FormSummaryAnswersNested;
