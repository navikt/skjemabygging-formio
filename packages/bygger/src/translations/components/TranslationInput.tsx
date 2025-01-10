import { Textarea, TextField } from '@navikt/ds-react';
import { FocusEvent } from 'react';
import WysiwygEditor from '../../components/wysiwyg/WysiwygEditor';

interface Props {
  label: string;
  defaultValue?: string;
  isHtml: boolean;
  minRows: number;
  onChange: (value: string) => void;
  error?: string;
}

const TranslationInput = ({ label, defaultValue, isHtml, minRows, onChange, error }: Props) => {
  const handleBlur = (event: FocusEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    onChange(event.currentTarget.value);
  };

  if (isHtml) {
    return <WysiwygEditor onBlur={onChange} defaultValue={defaultValue} />;
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
