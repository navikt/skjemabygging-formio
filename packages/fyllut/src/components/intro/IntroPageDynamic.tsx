import { Accordion } from '@navikt/ds-react';
import { Intro, useAppConfig, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import IntroPageButtonRow from './IntroPageButtonRow';
import { useIntroPage } from './IntroPageContext';

const IntroPageDynamic = () => {
  const { submissionMethod } = useAppConfig();
  const { translate } = useLanguages();
  const { form, state } = useIntroPage();

  if (!state) return;

  return (
    <>
      <Intro.GuidPanel description={form.introPage?.introduction} translate={translate} className="mb" />
      <Intro.ImportantInformation
        title={form.introPage?.importantInformation?.title}
        description={form.introPage?.importantInformation?.description}
        translate={translate}
        className="mb"
      />
      <Intro.Scope properties={form.introPage?.sections?.scope} translate={translate} className="mb" />
      <Intro.OutOfScope properties={form.introPage?.sections?.outOfScope} translate={translate} className="mb" />
      <Intro.Prerequisites
        properties={form.introPage?.sections?.prerequisites}
        translate={translate}
        submissionMethod={submissionMethod}
        className="mb"
      />
      <Accordion className="mb">
        <Intro.DataDisclosure properties={form.introPage?.sections?.dataDisclosure} translate={translate} />
        <Intro.DataTreatment properties={form.introPage?.sections?.dataTreatment} translate={translate} />
        <Intro.DataStorage translate={translate} submissionMethod={submissionMethod} />
        <Intro.AutomaticProcessing properties={form.introPage?.sections?.automaticProcessing} translate={translate} />
        <Intro.Optional properties={form.introPage?.sections?.optional} translate={translate} />
      </Accordion>
      <Intro.SelfDeclaration description={form.introPage?.selfDeclaration ?? ''} translate={translate} className="mb" />

      <IntroPageButtonRow />
    </>
  );
};

export default IntroPageDynamic;
