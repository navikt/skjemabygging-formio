import Address from '../../components/address/Address';
import EnhetSelector from '../../components/select/enhet/EnhetSelector';
import { useForm } from '../../context/form/FormContext';
import StaticPdfAttachments from './components/StaticPdfAttachments';
import StaticPdfIdentity from './components/StaticPdfIdentity';

const StaticPdfInputPage = () => {
  const { form, submission, setSubmission } = useForm();
  const { enhetMaVelgesVedPapirInnsending, enhetstyper } = form.properties;

  const handleChange = (changes: { [key: string]: any }) => {
    setSubmission({
      data: {
        ...submission?.data,
        ...changes,
      },
    });
  };

  return (
    <>
      <div className="mb">
        {enhetMaVelgesVedPapirInnsending ? (
          <EnhetSelector
            enhetstyper={enhetstyper}
            onSelectEnhet={(enhetNummer) => {
              if (enhetNummer) {
                handleChange({ enhetNummer });
              }
            }}
          />
        ) : (
          <>
            <StaticPdfIdentity />
            <Address onChange={handleChange}></Address>
          </>
        )}
      </div>

      <StaticPdfAttachments onChange={handleChange} />
    </>
  );
};

export default StaticPdfInputPage;
