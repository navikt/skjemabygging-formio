import React, { MouseEventHandler } from "react";
import { useLanguages } from "../../context/languages";

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
  submissionMethod = "paper",
}: Props) => {
  const { currentLanguage } = useLanguages();
  // const { config = {} } = useAppConfig();
  const translationsForPDF = currentLanguage !== "nb-NO" ? translations[currentLanguage] : {};
  return (
    <>
      <form id={form.path} action={actionUrl} method="post" acceptCharset="utf-8" target="_blank" hidden>
        <textarea hidden={true} name="submission" readOnly={true} required value={JSON.stringify(submission)} />
        <textarea hidden={true} name="form" readOnly={true} required value={JSON.stringify(form)} />
        {/*{config.isDelingslenke && <input type="text" name="isTest" value="true" />}*/}
        <input type="text" name="submissionMethod" value={submissionMethod} />
        <textarea
          hidden={true}
          name="translations"
          readOnly={true}
          required
          value={JSON.stringify(translationsForPDF)}
        />
        <input type="text" name="language" value={currentLanguage} />
      </form>
      <div>
        <input
          form={form.path}
          className="navds-button navds-button--primary navds-label"
          onClick={onClick}
          type="submit"
          value={label}
        />
      </div>
    </>
  );
};

export default DownloadPdfButton;
