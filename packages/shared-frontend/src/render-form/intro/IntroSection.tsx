import { Heading, List } from '@navikt/ds-react';
import { IntroPageSection } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguage } from '../../context/language/LanguageContext';
import RichText from './RichText';

const IntroSection = ({ section, level = '2' }: { section?: IntroPageSection; level?: '2' | '3' }) => {
  const { translate } = useLanguage();
  if (!section?.title) {
    return null;
  }

  return (
    <section>
      <Heading level={level} size={level === '2' ? 'large' : 'medium'} spacing>
        {translate(section.title)}
      </Heading>
      <RichText content={translate(section.description)} />
      {!!section.bulletPoints?.length && (
        <List data-aksel-migrated-v8>
          {section.bulletPoints.map((bulletPoint, index) => (
            <List.Item key={`${bulletPoint}-${index}`}>
              <RichText content={translate(bulletPoint)} />
            </List.Item>
          ))}
        </List>
      )}
    </section>
  );
};

export default IntroSection;
