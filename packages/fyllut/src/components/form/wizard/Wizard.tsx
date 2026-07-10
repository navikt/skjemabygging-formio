import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { Route, Routes } from 'react-router';
import { SUMMARY_KEY } from './constants';
import IntroStep from './IntroStep';
import PanelStep from './PanelStep';
import SummaryStep from './SummaryStep';

const Wizard = ({ form }: { form: Form }) => {
  return (
    <Routes>
      <Route path="" element={<IntroStep form={form} />} />
      <Route path={SUMMARY_KEY} element={<SummaryStep form={form} />} />
      <Route path=":panelSlug" element={<PanelStep form={form} />} />
    </Routes>
  );
};

export default Wizard;
