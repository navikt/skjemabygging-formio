import { useLanguage } from '../../context/language/LanguageContext';
import { sanitizeHtml } from '../../utils/sanitizeHtml';
import FormElementBox from '../shared/FormElementBox';
import htmlStyles from '../shared/FormHtml.module.css';
import styles from './Image.module.css';

interface ImageProps {
  src: string;
  alt?: string;
  widthPercent?: number;
  description?: string;
}

const toWidth = (widthPercent?: number) => {
  const percent = Number(widthPercent);

  if (!percent || percent > 100) {
    return '100%';
  }

  return `${percent}%`;
};

const Image = ({ src, alt, widthPercent, description }: ImageProps) => {
  const { translate } = useLanguage();

  return (
    <FormElementBox>
      <img
        className={styles.image}
        src={src}
        alt={alt ? translate(alt) : ''}
        style={{ width: toWidth(widthPercent) }}
      />
      {description && (
        <div
          className={`${htmlStyles.content} ${styles.description}`}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(translate(description)) }}
        />
      )}
    </FormElementBox>
  );
};

export default Image;
export type { ImageProps };
