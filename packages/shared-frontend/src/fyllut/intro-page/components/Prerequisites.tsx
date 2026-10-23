import IntroSection, { IntroSectionProps } from './IntroSection';

const Prerequisites = (props: Omit<IntroSectionProps, 'headingLevel' | 'headingSize'>) => (
  <IntroSection {...props} headingLevel="2" headingSize="large" />
);

export default Prerequisites;
