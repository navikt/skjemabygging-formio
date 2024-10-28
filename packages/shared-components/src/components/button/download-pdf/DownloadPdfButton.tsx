import { MouseEventHandler } from 'react';

interface Props {
  id: string;
  values: Record<string, string | undefined>;
  actionUrl: string;
  label: string;
  onClick: MouseEventHandler<HTMLInputElement>;
}

const DownloadPdfButton = ({ id, values, actionUrl, label, onClick }: Props) => {
  return (
    <>
      <form id={id} action={actionUrl} method="post" acceptCharset="utf-8" target="_blank" hidden>
        {Object.entries(values).map(([key, value]) => (
          <input hidden required readOnly={true} type="text" name={key} key={key} value={value} />
        ))}
        <input type="text" name="submissionMethod" value="paper" readOnly={true} />
      </form>
      <div className="mb-4">
        <input
          form={id}
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
