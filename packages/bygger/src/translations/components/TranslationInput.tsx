import { TextField, Textarea } from '@navikt/ds-react';
import { guid } from '@navikt/skjemadigitalisering-shared-domain';
import { FocusEventHandler, useEffect, useState } from 'react';

interface Props {
  inputKey: string;
  label: string;
  defaultValue?: string;
  isHtml?: boolean;
  minRows: number;
  onChange: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  error?: string;
}

// docs: https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-build-classic
const CKEditor = ({ editorId }) => {
  const [initialized, setInitialized] = useState(false);
  const [id, setId] = useState();
  const ClassicEditor = global.ClassicEditor;

  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      ClassicEditor.create(document.querySelector(`#${editorId}`))
        .then((editor) => {
          console.log('editor', editor);
          window.editors = { ...(window.editors ?? {}), [editor.id]: editor };
          setId(editor.id);
        })
        .catch((error) => {
          console.error('There was a problem initializing the editor.', error);
        });
    }
  }, [ClassicEditor, editorId, initialized]);

  useEffect(
    () => () => {
      if (id) {
        delete window['editors'][id];
        setId(undefined);
      }
    },
    [id],
  );

  return <></>;
};

const TranslationInput = ({ label, defaultValue, isHtml, minRows, onChange, error }: Props) => {
  const ClassicEditor = global.ClassicEditor;

  console.log('ckeditor global', ClassicEditor);

  if (isHtml) {
    const editorId = `editor-${guid()}`;

    return (
      <>
        <div id={editorId}>
          <p>Here goes the initial content of the editor.</p>
        </div>
        <CKEditor editorId={editorId} />
      </>
    );
  }

  if (minRows > 2) {
    return (
      <Textarea
        label={label}
        hideLabel
        minRows={minRows}
        resize="vertical"
        defaultValue={defaultValue}
        onBlur={onChange}
        error={error}
      />
    );
  }
  return <TextField label={label} hideLabel defaultValue={defaultValue} onBlur={onChange} error={error} />;
};

export default TranslationInput;
