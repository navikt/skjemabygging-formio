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

    const { isHtmlString, groupLonelySiblings, sanitizeHtmlString, removeEmptyTags, removeTags, extractTextContent } =
      htmlUtils;

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
    const removeDivs = (html: string) => removeTags(html, ['div']);

    const handleChange = (event) => {
      const value = event.target.value;
      // make sure that non-html strings are wrapped in a tag.
      if (isHtmlString(value)) {
        setHtmlValue(removeUnwantedTags(value));
      } else {
        setHtmlValue(`<${defaultTag}>${value}</${defaultTag}>`);
      }
    };

    const handleBlur = () => {
      const sanitizedHtml = removeEmptyTags(sanitizeHtmlString(htmlValue, { FORBID_ATTR: ['style'] }));
      // Apply removeUnwantedTags, then wrap top level text nodes (+ a, b and strong tags) in <p>
      // Then, remove divs in case they were not removed by removeUnwantedTags
      const reorganizedHtml = removeDivs(groupLonelySiblings(removeUnwantedTags(sanitizedHtml)));
      const trimmed = extractTextContent(reorganizedHtml).trim() === '' ? '' : reorganizedHtml;
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
