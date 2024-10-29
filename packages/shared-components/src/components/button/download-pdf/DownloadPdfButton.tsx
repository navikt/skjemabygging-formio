import { FormEventHandler } from 'react';

interface Props {
  id: string;
  values: Record<string, string | null>;
  actionUrl: string;
  label: string;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

const DownloadPdfButton = ({ id, values, actionUrl, label, onSubmit }: Props) => {
  return (
    <>
      <form id={id} action={actionUrl} onSubmit={onSubmit} method="post" acceptCharset="utf-8" target="_blank" hidden>
        {Object.entries(values).map(([key, value]) => (
          <input hidden readOnly={true} type="text" name={key} key={key} value={value ?? ''} />
        ))}
        <input type="text" name="submissionMethod" value="paper" readOnly={true} />
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
