import { Accordion } from '@navikt/ds-react';
import { Intro } from '@navikt/skjemadigitalisering-shared-components';
import IntroPageButtonRow from './IntroPageButtonRow';
import { useIntroPage } from './IntroPageContext';

const IntroPageDynamic = () => {
  const { form, state } = useIntroPage();

  if (!state) return;

  return (
    <>
      <Intro.GuidPanel description={form.introPage?.introduction} className="mb" />
      <Intro.ImportantInformation
        title={form.introPage?.importantInformation?.title}
        description={form.introPage?.importantInformation?.description}
        className="mb"
      />
      <Intro.Scope properties={form.introPage?.sections?.scope} className="mb" />
      <Intro.OutOfScope properties={form.introPage?.sections?.outOfScope} className="mb" />
      <Intro.Prerequisites properties={form.introPage?.sections?.prerequisites} className="mb" />
      <Accordion className="mb">
        <Intro.DataDisclosure properties={form.introPage?.sections?.dataDisclosure} />
        <Intro.DataTreatment properties={form.introPage?.sections?.dataTreatment} />
        <Intro.DataStorage properties={form.introPage?.sections?.dataStorage} />
        <Intro.AutomaticProcessing properties={form.introPage?.sections?.automaticProcessing} />
        <Intro.Optional properties={form.introPage?.sections?.optional} />
      </Accordion>
      <Intro.SelfDeclaration description={form.introPage?.selfDeclaration ?? ''} className="mb" />

      <IntroPageButtonRow />
    </>
  );
};

export default IntroPageDynamic;
