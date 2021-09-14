import React from 'react';

interface Props {
  form: any;
  submission: any;
  actionUrl: string;
  label: string;
  onClick: Function;
  classNames: string;
}

const DownloadPdfButton = ({ form, submission, actionUrl, label, onClick, classNames }: Props) => {
  return (
    <>
      <form
        id={form.path}
        action={actionUrl}
        method="post"
        acceptCharset="utf-8"
        target="_blank"
        hidden
      >
        <textarea hidden={true} name="submission" readOnly={true} required value={JSON.stringify(submission)} />
        <textarea hidden={true} name="form" readOnly={true} required value={JSON.stringify(form)} />
      </form>
      <div>
        <input
          form={form.path}
          className={classNames}
          onClick={onClick}
          type="submit"
          value={label}
        />
      </div>
    </>
  );
};

export default DownloadPdfButton;
