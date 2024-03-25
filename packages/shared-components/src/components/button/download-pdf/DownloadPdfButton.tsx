import { MouseEventHandler } from 'react';
import { useLanguages } from '../../../context/languages';

interface Props {
  form: any;
  submission: any;
  actionUrl: string;
  label: string;
  onClick: MouseEventHandler<HTMLInputElement>;
  translations: { [key: string]: string } | {};
  submissionMethod?: string;
}

const DownloadPdfButton = ({
  form,
  submission,
  actionUrl,
  label,
  onClick,
  translations,
  submissionMethod = 'paper',
}: Props) => {
  const { currentLanguage } = useLanguages();
  const translationsForPDF = currentLanguage !== 'nb-NO' ? translations[currentLanguage] : {};
  return (
    <>
      <form id={form.path} action={actionUrl} method="post" acceptCharset="utf-8" target="_blank" hidden>
        <textarea hidden={true} name="submission" readOnly={true} required value={JSON.stringify(submission)} />
        <textarea hidden={true} name="form" readOnly={true} required value={JSON.stringify(form)} />
        <input type="text" name="submissionMethod" value={submissionMethod} readOnly={true} />
        <textarea
          hidden={true}
          name="translations"
          readOnly={true}
          required
          value={JSON.stringify(translationsForPDF)}
        />
        <input type="text" name="language" value={currentLanguage} readOnly={true} />
      </form>
      <div className="mb-4">
        <input
          form={form.path}
          className="navds-button navds-button--primary navds-body-short font-bold"
          onClick={onClick}
          type="submit"
          value={label}
        />
      </div>
    </>
  );
};

export default DownloadPdfButton;
