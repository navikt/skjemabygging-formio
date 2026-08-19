import IntroSection, { IntroSectionProps } from './IntroSection';

const OutOfScope = (props: Omit<IntroSectionProps, 'headingLevel' | 'headingSize'>) => (
  <IntroSection {...props} headingLevel="3" headingSize="medium" />
);

export default OutOfScope;
