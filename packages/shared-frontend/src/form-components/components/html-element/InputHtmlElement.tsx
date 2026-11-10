import ReadMore from '../../../components/read-more/ReadMore';
import FormElementBox from '../../../components/shared/FormElementBox';
import styles from '../../../components/shared/FormHtml.module.css';
import { useLanguage } from '../../../context/language/LanguageContext';
import { sanitizeHtml } from '../../../utils/sanitizeHtml';
import { HtmlElementDefinition } from '../../component-types';

interface InputHtmlElementProps {
  component: HtmlElementDefinition;
}

const InputHtmlElement = ({ component }: InputHtmlElementProps) => {
  const { translate } = useLanguage();

  if (!component.content) {
    return null;
  }

  return (
    <FormElementBox>
      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(translate(component.content)) }}
      />
      {component.additionalDescriptionLabel && component.additionalDescriptionText && (
        <ReadMore label={component.additionalDescriptionLabel} text={component.additionalDescriptionText} />
      )}
    </FormElementBox>
  );
};

export default InputHtmlElement;
