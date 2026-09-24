import { Accordion as AkselAccordion } from '@navikt/ds-react';
import { AccordionSettingValues } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguage } from '../../context/language/LanguageContext';
import { sanitizeHtml } from '../../utils/sanitizeHtml';
import ReadMore, { ReadMoreProps } from '../read-more/ReadMore';
import FormElementBox from '../shared/FormElementBox';

interface AccordionProps {
  values?: AccordionSettingValues;
  readMore?: ReadMoreProps;
}

const Accordion = ({ values, readMore }: AccordionProps) => {
  const { translate } = useLanguage();

  if (!values || values.length === 0) {
    return null;
  }

  return (
    <FormElementBox>
      <AkselAccordion>
        {values.map((item, index) => (
          <AkselAccordion.Item key={`${item.title}-${index}`} defaultOpen={item.defaultOpen}>
            <AkselAccordion.Header>{translate(item.title)}</AkselAccordion.Header>
            <AkselAccordion.Content>
              <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(translate(item.content)) }} />
            </AkselAccordion.Content>
          </AkselAccordion.Item>
        ))}
      </AkselAccordion>
      {readMore && <ReadMore {...readMore} />}
    </FormElementBox>
  );
};

export default Accordion;
export type { AccordionProps };
