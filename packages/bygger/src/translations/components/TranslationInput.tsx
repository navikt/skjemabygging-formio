import { Textarea, TextField } from '@navikt/ds-react';
import { ChangeEvent } from 'react';
import WysiwygEditor from '../../components/wysiwyg/WysiwygEditor';

interface Props {
  label: string;
  defaultValue?: string;
  isHtml: boolean;
  minRows: number;
  onChange: (value: string) => void;
  error?: string;
  autoFocus?: boolean;
}

const TranslationInput = ({ label, defaultValue, isHtml, minRows, onChange, error, autoFocus }: Props) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(event.currentTarget.value);
  };

  if (isHtml) {
    return <WysiwygEditor autoFocus={autoFocus} onChange={onChange} defaultValue={defaultValue} error={error} />;
  }
  if (minRows > 2) {
    return (
      <Textarea
        autoFocus={autoFocus}
        className={error ? 'navds-textarea--error' : ''}
        label={label}
        hideLabel
        minRows={minRows}
        resize="vertical"
        defaultValue={defaultValue}
        onChange={handleChange}
      />
    );
  }
  return (
    <TextField
      autoFocus={autoFocus}
      className={error ? 'navds-text-field--error' : ''}
      label={label}
      hideLabel
      defaultValue={defaultValue}
      onChange={handleChange}
    />
  );
};

export default TranslationInput;
