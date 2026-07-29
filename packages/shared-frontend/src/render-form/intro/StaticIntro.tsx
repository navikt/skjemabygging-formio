import { GuidePanel, Heading, List } from '@navikt/ds-react';
import { TEXTS, dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useAppConfig } from '../../context/app-config/AppConfigContext';
import { useLanguage } from '../../context/language/LanguageContext';

const StaticIntro = ({ tokenExpiration }: { tokenExpiration?: number }) => {
  const { translate } = useLanguage();
  const { submissionMethod } = useAppConfig();
  return (
    <GuidePanel poster>
      <Heading level="2" size="small" spacing>
        {translate(TEXTS.statiske.introPage.title)}
      </Heading>
      <List data-aksel-migrated-v8>
        {submissionMethod === 'paper' && (
          <List.Item>
            <strong>{translate(TEXTS.statiske.introPage.paperDescriptionBold)} </strong>
            {translate(TEXTS.statiske.introPage.paperDescription)}
          </List.Item>
        )}
        {submissionMethod === 'digitalnologin' && (
          <List.Item>
            <strong>
              {translate(TEXTS.statiske.introPage.nologinTimeLimitBold, {
                tokenExpirationTime: tokenExpiration
                  ? dateUtils.formatUnixEpochSecondsToLocalTime(tokenExpiration)
                  : 'XX.XX',
              })}{' '}
            </strong>
            {translate(TEXTS.statiske.introPage.nologinTimeLimit)}
          </List.Item>
        )}
        <List.Item>
          <strong>{translate(TEXTS.statiske.introPage.requiredFieldsBold)} </strong>
          {translate(TEXTS.statiske.introPage.requiredFields)}
        </List.Item>
        <List.Item>
          <strong>
            {translate(
              submissionMethod === 'digital'
                ? TEXTS.statiske.introPage.autoSaveBold
                : TEXTS.statiske.introPage.notSaveBold,
            )}{' '}
          </strong>
          {translate(
            submissionMethod === 'digital' ? TEXTS.statiske.introPage.autoSave : TEXTS.statiske.introPage.notSave,
          )}
        </List.Item>
        <List.Item>
          <strong>{translate(TEXTS.statiske.introPage.publicComputerBold)} </strong>
          {translate(TEXTS.statiske.introPage.publicComputer)}
        </List.Item>
      </List>
    </GuidePanel>
  );
};

export default StaticIntro;
