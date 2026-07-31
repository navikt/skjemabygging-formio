import { GuidePanel as AkselGuidePanel, Alert, Checkbox, CheckboxGroup, Heading } from '@navikt/ds-react';
import { SubmissionMethod, TranslateFunction, dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { InnerHtmlLong } from '../Html';
import { IntroBulletPoints } from './IntroShared';

const GuidePanel = ({
  description,
  translate,
  className,
}: {
  description?: string;
  translate: TranslateFunction;
  className?: string;
}) => {
  if (!description) {
    return null;
  }

  return (
    <AkselGuidePanel poster className={className}>
      <Heading level="2" size="small" spacing>
        {translate('introPage.guidePanel.hi')}
      </Heading>
      <InnerHtmlLong content={translate(description)} />
    </AkselGuidePanel>
  );
};

const ImportantInformation = ({
  title,
  description,
  translate,
  className,
}: {
  title?: string;
  description?: string;
  translate: TranslateFunction;
  className?: string;
}) => {
  if (!description) {
    return null;
  }

  return (
    <Alert variant="info" className={className}>
      {title && (
        <Heading level="2" size="small" spacing>
          {translate(title)}
        </Heading>
      )}
      <InnerHtmlLong content={translate(description)} />
    </Alert>
  );
};

const BeAwareOf = ({
  tokenExp,
  translate,
  submissionMethod,
  className,
}: {
  tokenExp?: number;
  translate: TranslateFunction;
  submissionMethod?: SubmissionMethod;
  className?: string;
}) => {
  const tokenExpirationTime = tokenExp ? dateUtils.formatUnixEpochSecondsToLocalTime(tokenExp) : 'XX.XX';
  const values = [
    ...(submissionMethod === 'paper' ? ['introPage.beAwareOf.sendByMail', 'introPage.beAwareOf.timeLimit'] : []),
    ...(submissionMethod === 'digitalnologin'
      ? [
          { key: 'introPage.beAwareOf.timeLimitNologin', params: { tokenExpirationTime } },
          'introPage.beAwareOf.notSave',
        ]
      : []),
    'introPage.beAwareOf.mandatoryFields',
    'introPage.beAwareOf.useOfPublicComputers',
  ];

  return (
    <div className={className}>
      <Heading level="2" size="large" spacing>
        {translate('introPage.beAwareOf.title')}
      </Heading>
      <IntroBulletPoints
        values={values.map((value) =>
          typeof value === 'string' ? translate(value) : translate(value.key, value.params),
        )}
      />
    </div>
  );
};

const SelfDeclaration = ({
  description,
  className,
  translate,
  error,
  setSelfDeclaration,
  value,
}: {
  description: string;
  translate: TranslateFunction;
  className?: string;
  setSelfDeclaration?: (selfDeclaration: boolean) => void;
  error?: string;
  value?: boolean;
}) => {
  if (!description) {
    return null;
  }

  return (
    <div className={className}>
      <InnerHtmlLong content={translate(description)} />
      <CheckboxGroup
        legend="introPage.selfDeclaration.inputLabel"
        hideLegend
        error={error}
        value={value ? ['selfDeclaration'] : []}
      >
        <Checkbox
          value="selfDeclaration"
          onChange={(event) => setSelfDeclaration?.(event.target.checked)}
          error={!!error}
        >
          {translate('introPage.selfDeclaration.inputLabel')}
        </Checkbox>
      </CheckboxGroup>
    </div>
  );
};

export { BeAwareOf, GuidePanel, ImportantInformation, SelfDeclaration };
