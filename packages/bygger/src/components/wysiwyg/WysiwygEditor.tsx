import { htmlUtils, makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { PortableText, PortableTextReactComponents } from '@portabletext/react';
import classNames from 'classnames';
import { useState } from 'react';
import { EditorProvider } from 'react-simple-wysiwyg';
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
  const [value, setValue] = useState(defaultValue ? JSON.parse(defaultValue) : []);
  const styles = useStyles();

  const handleChange = (newValue: any) => {
    setValue(newValue);
  };

  const handleBlur = () => {
    const serialized = JSON.stringify(value);
    const sanitized = htmlUtils.sanitizeHtmlString(serialized, { FORBID_ATTR: ['style'] });
    const trimmed = htmlUtils.extractTextContent(sanitized).trim() === '' ? '' : sanitized;
    onBlur(trimmed);
  };

  const components: Partial<PortableTextReactComponents> = {
    marks: {
      strong: ({ children }) => <strong>{children}</strong>,
      link: ({ value, children }) => <a href={value?.href}>{children}</a>,
    },
    list: {
      bullet: ({ children }) => <ul>{children}</ul>,
      number: ({ children }) => <ol>{children}</ol>,
    },
    // types: {
    //   block: ({ children }) => <p>{children}</p>,
    // },
  };

  return (
    <EditorProvider>
      <div className={error ? classNames(styles.editor, styles.error) : styles.editor}>
        <TextTypeDropdown />
        <LinkButton />
        {/* Add your custom toolbar/buttons here */}
        <PortableText value={value} components={components} />
        <textarea
          style={{ display: 'none' }}
          value={JSON.stringify(value)}
          onChange={(e) => handleChange(JSON.parse(e.target.value))}
          onBlur={handleBlur}
          autoFocus={autoFocus}
        />
      </div>
    </EditorProvider>
  );
};

export default WysiwygEditor;
