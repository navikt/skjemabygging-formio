import { useForm } from '../../context/form/FormContext';

const StaticPdfDownloadPage = () => {
  const { submission } = useForm();
  console.log(submission);

  return <div className="mb"></div>;
};

export default StaticPdfDownloadPage;
