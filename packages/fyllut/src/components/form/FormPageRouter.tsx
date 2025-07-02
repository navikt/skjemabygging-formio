import { Route, Routes } from 'react-router-dom';
import IntroPage from '../intro/IntroPage';
import FormPage from './FormPage';

const FormPageRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<IntroPage />} />
      <Route path="/*" element={<FormPage />} />
    </Routes>
  );
};

export default FormPageRouter;
