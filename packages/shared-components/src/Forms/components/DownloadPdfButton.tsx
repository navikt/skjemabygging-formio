import React, { MouseEventHandler } from "react";
import { useAppConfig } from "../../configContext";
import { useLanguages } from "../../context/languages";

interface Props {
  form: any;
  submission: any;
  actionUrl: string;
  label: string;
  onClick: MouseEventHandler<HTMLInputElement>;
  translations: { [key: string]: string } | {};
}

const DownloadPdfButton = ({ form, submission, actionUrl, label, onClick, translations }: Props) => {
  const { currentLanguage } = useLanguages();
  const { config = {} } = useAppConfig();
  const translationsForPDF = currentLanguage !== "nb-NO" ? translations[currentLanguage] : {};
  return (
    <>
      <form id={form.path} action={actionUrl} method="post" acceptCharset="utf-8" target="_blank" hidden>
        <textarea hidden={true} name="submission" readOnly={true} required value={JSON.stringify(submission)} />
        <textarea hidden={true} name="form" readOnly={true} required value={JSON.stringify(form)} />
        {config.isDelingslenke && <input type="text" name="isTest" value="true" />}
        <textarea
          hidden={true}
          name="translations"
          readOnly={true}
          required
          value={JSON.stringify(translationsForPDF)}
        />
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
