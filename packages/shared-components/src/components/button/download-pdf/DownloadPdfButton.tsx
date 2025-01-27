import { FormEventHandler } from 'react';

interface Props {
  id: string;
  values: Record<string, string | null>;
  actionUrl: string;
  label: string;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  submissionMethod?: string;
}

const DownloadPdfButton = ({ id, values, actionUrl, label, onSubmit, submissionMethod = 'paper' }: Props) => {
  return (
    <>
      <form id={id} action={actionUrl} onSubmit={onSubmit} method="post" acceptCharset="utf-8" target="_blank" hidden>
        {values &&
          Object.entries(values).map(([key, value]) => (
            <textarea hidden readOnly={true} name={key} key={key} value={value ?? ''} />
          ))}
        <input type="text" name="submissionMethod" value={submissionMethod} readOnly={true} />
      </form>
      <div className="mb-4">
        <input
          form={id}
          className="navds-button navds-button--primary navds-body-short font-bold"
          type="submit"
          value={label}
        />
      </div>
    </>
  );
};

export default DownloadPdfButton;
