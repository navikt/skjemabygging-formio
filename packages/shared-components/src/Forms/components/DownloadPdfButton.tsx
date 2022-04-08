import React, { MouseEventHandler } from "react";
import { useLanguages } from "../../context/languages";

interface Props {
  form: any;
  submission: any;
  actionUrl: string;
  label: string;
  onClick: MouseEventHandler<HTMLInputElement>;
  classNames: string;
  translations: { [key: string]: string } | {};
}

const DownloadPdfButton = ({ form, submission, actionUrl, label, onClick, classNames, translations }: Props) => {
  const { currentLanguage } = useLanguages();
  const translationsForPDF = currentLanguage !== "nb-NO" ? translations[currentLanguage] : {};
  return (
    <>
      <form id={form.path} action={actionUrl} method="post" acceptCharset="utf-8" target="_blank" hidden>
        <textarea hidden={true} name="submission" readOnly={true} required value={JSON.stringify(submission)} />
        <textarea hidden={true} name="form" readOnly={true} required value={JSON.stringify(form)} />
        <textarea
          hidden={true}
          name="translations"
          readOnly={true}
          required
          value={JSON.stringify(translationsForPDF)}
        />
      </form>
      <div>
        <input form={form.path} className={classNames} onClick={onClick} type="submit" value={label} />
      </div>
    </>
  );
};

export default DownloadPdfButton;
