import { htmlConverter } from '@navikt/skjemadigitalisering-shared-components';
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

const WysiwygEditor = ({ defaultValue, onBlur }: Props) => {
  const [htmlValue, setHtmlValue] = useState(defaultValue ?? '');

  const handleChange = (event) => {
    const value = event.target.value;
    // make sure that non-html strings are wrapped in a <p>-tag.
    if (htmlConverter.isHtmlString(value)) {
      setHtmlValue(value);
    } else {
      setHtmlValue(`<p>${value}</p>`);
    }
  };

  const handleBlur = () => {
    const sanitized = htmlConverter.sanitizeHtmlString(htmlValue, { FORBID_ATTR: ['style'] });
    onBlur(sanitized);
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
