import { Accordion } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect } from 'react';
import Intro from '../../components/intro';
import { useAppConfig } from '../../context/config/configContext';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import { useSendInn } from '../../context/sendInn/sendInnContext';
import IntroPageButtonRow from './IntroPageButtonRow';
import { useIntroPage } from './IntroPageContext';

const IntroPageDynamic = () => {
  const { submissionMethod } = useAppConfig();
  const { translate } = useLanguages();
  const { setSelfDeclaration, selfDeclaration, error, form, state } = useIntroPage();
  const { isMellomlagringReady, tokenDetails } = useSendInn();
  const { setTitle, setFormProgressVisible } = useForm();

  useEffect(() => {
    setTitle(TEXTS.grensesnitt.introPage.title);
    setFormProgressVisible(true);
  }, [setTitle, setFormProgressVisible]);

  if (!state || (submissionMethod === 'digital' && !isMellomlagringReady)) return;

  return (
    <>
      <Intro.GuidePanel description={form.introPage?.introduction} translate={translate} className="mb" />
      <Intro.ImportantInformation
        title={form.introPage?.importantInformation?.title}
        description={form.introPage?.importantInformation?.description}
        translate={translate}
        className="mb"
      />
      <Intro.Scope properties={form.introPage?.sections?.scope} translate={translate} className="mb" />
      <Intro.OutOfScope properties={form.introPage?.sections?.outOfScope} translate={translate} className="mb" />
      <Intro.Prerequisites properties={form.introPage?.sections?.prerequisites} translate={translate} className="mb" />
      <Intro.BeAwareOf
        translate={translate}
        tokenExp={tokenDetails?.exp}
        submissionMethod={submissionMethod}
        className="mb"
      />
      <Accordion className="mb">
        <Intro.DataDisclosure properties={form.introPage?.sections?.dataDisclosure} translate={translate} />
        <Intro.DataTreatment properties={form.introPage?.sections?.dataTreatment} translate={translate} />
        {submissionMethod === 'digital' && <Intro.DataStorage translate={translate} />}
        <Intro.AutomaticProcessing properties={form.introPage?.sections?.automaticProcessing} translate={translate} />
        <Intro.Optional properties={form.introPage?.sections?.optional} translate={translate} />
      </Accordion>
      <Intro.SelfDeclaration
        description={form.introPage?.selfDeclaration ?? ''}
        translate={translate}
        className="mb"
        error={error}
        setSelfDeclaration={setSelfDeclaration}
        value={selfDeclaration}
      />

      <IntroPageButtonRow />
    </>
  );
};

export default IntroPageDynamic;
