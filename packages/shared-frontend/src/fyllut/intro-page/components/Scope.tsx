import IntroSection, { IntroSectionProps } from './IntroSection';

const Scope = (props: Omit<IntroSectionProps, 'headingLevel' | 'headingSize'>) => (
  <IntroSection {...props} headingLevel="2" headingSize="large" />
);

export default Scope;
