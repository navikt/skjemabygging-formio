import { useForm } from '../../context/form/FormContext';

const StaticPdfDownloadPage = () => {
  const { submission } = useForm();
  console.log('Submission', submission);
  return <div className="mb"></div>;
};

export default StaticPdfDownloadPage;
