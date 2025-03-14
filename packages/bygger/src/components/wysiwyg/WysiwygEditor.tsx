import { htmlUtils, makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import classNames from 'classnames';
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

const useStyles = makeStyles({
  editor: {
    resize: 'vertical',
    backgroundColor: 'var(--a-bg-default)',
    minHeight: 'min-content',
    borderRadius: 'var(--a-border-radius-medium)',
  },
  error: {
    '&:not(:hover, :disabled)': {
      border: '2px solid',
      borderColor: 'var(--ac-textfield-error-border, var(--ac-textfield-error-border, var(--a-border-danger)))',
      boxShadow:
        '0 0 0 1px var(--ac-textfield-error-border, var(--__ac-textfield-error-border, var(--a-border-danger)))',
    },
  },
});

interface Props {
  defaultValue?: string;
  onBlur: (value: string) => void;
  error?: string | boolean;
  autoFocus?: boolean;
}

const WysiwygEditor = ({ defaultValue, onBlur, error, autoFocus }: Props) => {
  const [htmlValue, setHtmlValue] = useState(defaultValue ?? '');

  const styles = useStyles();

  const { sanitizeHtmlString, removeEmptyTags, removeTags, extractTextContent } = htmlUtils;

  const handleChange = (event) => {
    const value = event.target.value;
    // make sure that non-html strings are wrapped in a <p>-tag.
    if (htmlUtils.isHtmlString(value)) {
      setHtmlValue(value);
    } else {
      setHtmlValue(`<p>${value}</p>`);
    }
  };

  const handleBlur = () => {
    const removeUnwantedTags = (html: string) => removeTags(html, ['font', 'div']);
    const sanitizedHtmlString = removeUnwantedTags(
      removeEmptyTags(sanitizeHtmlString(htmlValue, { FORBID_ATTR: ['style'] })),
    );

    const trimmed = extractTextContent(sanitizedHtmlString).trim() === '' ? '' : sanitizedHtmlString;
    onBlur(trimmed);
  };

  return (
    <EditorProvider>
      <Editor
        autoFocus={autoFocus}
        value={htmlValue}
        onChange={handleChange}
        onBlur={handleBlur}
        containerProps={{ className: error ? classNames(styles.editor, styles.error) : styles.editor }}
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
