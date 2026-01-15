import { FieldsetErrorMessage, htmlUtils, makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import classNames from 'classnames';
import { forwardRef, useState } from 'react';
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
    backgroundColor: 'var(--ax-bg-default)',
    minHeight: 'min-content',
    borderRadius: 'var(--ax-radius-4)',
  },
  error: {
    '&:not(:hover, :disabled)': {
      border: '2px solid',
      borderColor: 'var(--ax-border-danger)',
      boxShadow: '0 0 0 1px var(--ax-border-danger)',
    },
  },
});

interface Props {
  defaultValue?: string;
  onBlur: (value: string) => void;
  defaultTag?: 'p' | 'div';
  error?: string | boolean;
  autoFocus?: boolean;
}

const WysiwygEditor = forwardRef<HTMLDivElement, Props>(
  ({ defaultValue, onBlur, defaultTag = 'p', error, autoFocus }, ref) => {
    const [htmlValue, setHtmlValue] = useState(defaultValue ?? '');

    const styles = useStyles();

    const { sanitizeHtmlString, removeEmptyTags, removeTags, extractTextContent } = htmlUtils;

    const handleChange = (event) => {
      const value = event.target.value;
      // make sure that non-html strings are wrapped in a <p>-tag.
      if (htmlUtils.isHtmlString(value)) {
        setHtmlValue(value);
      } else {
        setHtmlValue(`<${defaultTag}>${value}</${defaultTag}>`);
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
          data-testid="wysiwyg-editor"
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
        {error && typeof error === 'string' && <FieldsetErrorMessage errorMessage={error} ref={ref} />}
      </EditorProvider>
    );
  },
);

export default WysiwygEditor;
