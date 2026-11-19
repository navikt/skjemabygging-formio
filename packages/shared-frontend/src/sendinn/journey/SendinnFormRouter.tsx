import { Navigate, Route, Routes, useLocation } from 'react-router';
import { useFormDefinitionPanels } from '../../context/form-definition/FormDefinitionContext';
import { SUMMARY_KEY } from '../../form-flow/constants';
import { SendinnFormFlowLayout } from './SendinnFormFlowLayout';
import { SendinnFormPage } from './SendinnFormPage';
import { SendinnSummaryPage } from './SendinnSummaryPage';

const SendinnFormRouter = () => {
  const { search } = useLocation();
  const panels = useFormDefinitionPanels();
  const firstPanelKey = panels[0]?.key;

  return (
    <Routes>
      {firstPanelKey && <Route index element={<Navigate to={{ pathname: firstPanelKey, search }} replace />} />}
      <Route element={<SendinnFormFlowLayout />}>
        <Route path={SUMMARY_KEY} element={<SendinnSummaryPage />} />
        <Route path=":panelSlug" element={<SendinnFormPage />} />
      </Route>
    </Routes>
  );
};

export { SendinnFormRouter };
