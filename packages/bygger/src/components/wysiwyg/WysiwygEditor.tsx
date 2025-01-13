import { useState } from 'react';
import {
  BtnBold,
  BtnBulletList,
  BtnClearFormatting,
  BtnNumberedList,
  Editor,
  EditorProvider,
  Toolbar,
} from 'react-simple-wysiwyg';
import LinkButton from './LinkButton';
import TextTypeDropdown from './TextTypeDropdown';

interface Props {
  defaultValue?: string;
  onBlur: (value: string) => void;
}

const WysiwygEditor = ({ defaultValue = '', onBlur }: Props) => {
  const [htmlValue, setHtmlValue] = useState(defaultValue);

  const handleChange = (event) => {
    setHtmlValue(event.target.value);
  };

  const handleBlur = () => {
    onBlur(htmlValue);
  };

  return (
    <EditorProvider>
      <Editor
        value={htmlValue}
        onChange={handleChange}
        onBlur={handleBlur}
        containerProps={{ style: { resize: 'vertical', backgroundColor: 'white', minHeight: 'min-content' } }}
      >
        <Toolbar>
          <TextTypeDropdown />
          <BtnBold />
          <LinkButton />
          <BtnBulletList />
          <BtnNumberedList />
          <BtnClearFormatting />
        </Toolbar>
      </Editor>
    </EditorProvider>
  );
};

export default WysiwygEditor;
