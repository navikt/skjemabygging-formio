import { Accordion } from '@navikt/ds-react';
import { IntroPage, SubmissionMethod, TranslateFunction } from '@navikt/skjemadigitalisering-shared-domain';
import AutomaticProcessing from './components/AutomaticProcessing';
import BeAwareOf from './components/BeAwareOf';
import DataDisclosure from './components/DataDisclosure';
import DataStorage from './components/DataStorage';
import GuidePanel from './components/GuidePanel';
import ImportantInformation from './components/ImportantInformation';
import Optional from './components/Optional';
import OutOfScope from './components/OutOfScope';
import Prerequisites from './components/Prerequisites';
import Scope from './components/Scope';
import SelfDeclaration from './components/SelfDeclaration';
import styles from './IntroPage.module.css';

interface Props {
  introPage: IntroPage;
  submissionMethod?: SubmissionMethod;
  tokenExpiration?: number;
  translate: TranslateFunction;
  selfDeclaration?: boolean;
  selfDeclarationError?: string;
  onSelfDeclarationChange: (value: boolean) => void;
}

const IntroPageDynamic = ({
  introPage,
  submissionMethod,
  tokenExpiration,
  translate,
  selfDeclaration,
  selfDeclarationError,
  onSelfDeclarationChange,
}: Props) => (
  <>
    <GuidePanel description={introPage.introduction} translate={translate} className={styles.section} />
    <ImportantInformation
      title={introPage.importantInformation?.title}
      description={introPage.importantInformation?.description}
      translate={translate}
      className={styles.section}
    />
    <Scope properties={introPage.sections?.scope} translate={translate} className={styles.section} />
    <OutOfScope properties={introPage.sections?.outOfScope} translate={translate} className={styles.section} />
    <Prerequisites properties={introPage.sections?.prerequisites} translate={translate} className={styles.section} />
    <BeAwareOf
      translate={translate}
      submissionMethod={submissionMethod}
      tokenExp={tokenExpiration}
      className={styles.section}
    />
    <Accordion className={styles.section}>
      <DataDisclosure properties={introPage.sections?.dataDisclosure} translate={translate} />
      {submissionMethod === 'digital' && <DataStorage translate={translate} />}
      <AutomaticProcessing properties={introPage.sections?.automaticProcessing} translate={translate} />
      <Optional properties={introPage.sections?.optional} translate={translate} />
    </Accordion>
    <SelfDeclaration
      description={introPage.selfDeclaration ?? ''}
      translate={translate}
      className={styles.section}
      error={selfDeclarationError}
      setSelfDeclaration={onSelfDeclarationChange}
      value={selfDeclaration}
    />
  </>
);

export default IntroPageDynamic;
