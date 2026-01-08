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
  defaultTag?: 'p' | 'div';
  error?: string | boolean;
  autoFocus?: boolean;
}

const WysiwygEditor = forwardRef<HTMLDivElement, Props>(
  ({ defaultValue, onBlur, defaultTag = 'p', error, autoFocus }, ref) => {
    const [htmlValue, setHtmlValue] = useState(defaultValue ?? '');

    const styles = useStyles();

    const { sanitizeHtmlString, removeEmptyTags, removeTags, extractTextContent } = htmlUtils;

    const unwantedTags = [
      'font',
      'div',
      'span',
      'table',
      'tbody',
      'tr',
      'td',
      'th',
      'thead',
      'tfoot',
      'button',
      'svg',
      'path',
    ].filter((tag) => tag !== defaultTag);
    const removeUnwantedTags = (html: string) => removeTags(html, unwantedTags);

    const handleChange = (event) => {
      const value = event.target.value;
      // make sure that non-html strings are wrapped in a tag.
      if (htmlUtils.isHtmlString(value)) {
        setHtmlValue(removeUnwantedTags(value));
      } else {
        setHtmlValue(`<${defaultTag}>${value}</${defaultTag}>`);
      }
    };

    const handleBlur = () => {
      // Apply removeUnwantedTags, then wrap top level text nodes (+ a, b and strong tags) in <p>
      const cleanedHtml = htmlUtils.groupLonelyChildren(
        removeUnwantedTags(removeEmptyTags(sanitizeHtmlString(htmlValue, { FORBID_ATTR: ['style'] }))),
      );
      const trimmed = extractTextContent(cleanedHtml).trim() === '' ? '' : cleanedHtml;
      setHtmlValue(trimmed);
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
