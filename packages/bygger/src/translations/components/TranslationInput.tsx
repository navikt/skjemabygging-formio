import { Textarea, TextField } from '@navikt/ds-react';
import { FocusEvent, useState } from 'react';
import {
  BtnBold,
  BtnBulletList,
  BtnClearFormatting,
  BtnLink,
  BtnNumberedList,
  createDropdown,
  Editor,
  EditorProvider,
  Toolbar,
} from 'react-simple-wysiwyg';

interface Props {
  label: string;
  defaultValue?: string;
  isHtml: boolean;
  minRows: number;
  onChange: (value: string) => void;
  error?: string;
}

const CustomTextTypeDropdown = createDropdown('Skrifttype', [
  ['Uten formatering', 'formatBlock', 'DIV'],
  ['Avsnitt', 'formatBlock', 'P'],
  ['Overskrift', 'formatBlock', 'H3'],
  ['Underoverskrift', 'formatBlock', 'H4'],
]);

const TranslationInput = ({ label, defaultValue, isHtml, minRows, onChange, error }: Props) => {
  const [htmlValue, setHtmlValue] = useState(defaultValue ?? '');

  console.log('htmlValue', htmlValue);
  const handleHtmlChange = (event) => {
    console.log('handleHtmlChange', event);
    setHtmlValue(event.target.value);
  };

  const handleHtmlBlur = () => {
    onChange(htmlValue);
  };

  const handleBlur = (event: FocusEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    console.log(event);
    onChange(event.currentTarget.value);
  };

  if (isHtml) {
    return (
      <EditorProvider>
        <Editor
          value={htmlValue}
          onChange={handleHtmlChange}
          onBlur={handleHtmlBlur}
          containerProps={{ style: { resize: 'vertical', backgroundColor: 'white' } }}
        >
          <Toolbar>
            <CustomTextTypeDropdown />
            <BtnBold />
            <BtnLink />
            <BtnBulletList />
            <BtnNumberedList />
            <BtnClearFormatting />
          </Toolbar>
        </Editor>
      </EditorProvider>
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
        onBlur={handleBlur}
        error={error}
      />
    );
  }
  return <TextField label={label} hideLabel defaultValue={defaultValue} onBlur={handleBlur} error={error} />;
};

export default TranslationInput;
