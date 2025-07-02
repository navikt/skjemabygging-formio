import { Route, Routes } from 'react-router-dom';
import UploadPersonalIdPage from '../digitalnologin/UploadPersonalIdPage';
import IntroPage from '../intro/IntroPage';
import FormPage from './FormPage';

const FormPageRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<IntroPage />} />
      <Route path="/legitimasjon" element={<UploadPersonalIdPage />} />
      <Route path="/*" element={<FormPage />} />
    </Routes>
  );
};

export default FormPageRouter;
