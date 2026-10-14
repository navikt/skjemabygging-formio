import { GuidePanel, Heading } from '@navikt/ds-react';
import { SubmissionMethod, TEXTS, TranslateFunction, dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import styles from './IntroPage.module.css';

interface Props {
  submissionMethod?: SubmissionMethod;
  tokenExpiration?: number;
  translate: TranslateFunction;
}

const IntroPageStatic = ({ submissionMethod, tokenExpiration, translate }: Props) => {
  const isPaper = submissionMethod === 'paper';
  const isNoSubmission = submissionMethod === 'papernocoverpage';
  const isDigitalNoLogin = submissionMethod === 'digitalnologin';
  const savesDraft = submissionMethod === 'digital';

  return (
    <GuidePanel poster className={styles.staticPanel}>
      <Heading level="2" size="small" spacing>
        {translate(TEXTS.statiske.introPage.title)}
      </Heading>
      <ul>
        {isPaper && (
          <li className={styles.listItem}>
            <b>{translate(TEXTS.statiske.introPage.paperDescriptionBold)} </b>
            {translate(TEXTS.statiske.introPage.paperDescription)}
          </li>
        )}
        {isNoSubmission && (
          <li className={styles.listItem}>
            <b>{translate(TEXTS.statiske.introPage.noSubmissionDescriptionBold)} </b>
            {translate(TEXTS.statiske.introPage.noSubmissionDescription)}
          </li>
        )}
        {isDigitalNoLogin && (
          <li className={styles.listItem}>
            <b>
              {translate(TEXTS.statiske.introPage.nologinTimeLimitBold, {
                tokenExpirationTime: tokenExpiration
                  ? dateUtils.formatUnixEpochSecondsToLocalTime(tokenExpiration)
                  : 'XX.XX',
              })}{' '}
            </b>
            {translate(TEXTS.statiske.introPage.nologinTimeLimit)}
          </li>
        )}
        <li className={styles.listItem}>
          <b>{translate(TEXTS.statiske.introPage.requiredFieldsBold)} </b>
          {translate(TEXTS.statiske.introPage.requiredFields)}
        </li>
        <li className={styles.listItem}>
          <b>{translate(savesDraft ? TEXTS.statiske.introPage.autoSaveBold : TEXTS.statiske.introPage.notSaveBold)} </b>
          {translate(savesDraft ? TEXTS.statiske.introPage.autoSave : TEXTS.statiske.introPage.notSave)}
        </li>
        <li>
          <b>{translate(TEXTS.statiske.introPage.publicComputerBold)} </b>
          {translate(TEXTS.statiske.introPage.publicComputer)}
        </li>
      </ul>
    </GuidePanel>
  );
};

export default IntroPageStatic;
