import DOMPurify from 'dompurify';

interface TranslatedDescriptionProps {
  children?: string;
  translate: (text: string) => string;
}

const TranslatedDescription = ({ children, translate }: TranslatedDescriptionProps) => {
  const translatedContent = children ? translate(children) : undefined;

  if (!translatedContent) {
    return null;
  }

  return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(translatedContent, { ADD_ATTR: ['target'] }) }} />;
};

export default TranslatedDescription;
export type { TranslatedDescriptionProps };
