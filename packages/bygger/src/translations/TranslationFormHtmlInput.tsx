import { StructuredHtml } from '@navikt/skjemadigitalisering-shared-components';
import TranslationTextInput from './TranslationTextInput';
import { getInputType } from './utils';

interface Props {
  text: string;
  html: StructuredHtml;
  currentTranslation?: StructuredHtml;
  updateTranslation: (element: { id: string; value: string }) => void;
}

const TranslationFormHtmlInput = ({ text, html, currentTranslation, updateTranslation }: Props) => {
  const isMarkdown =
    StructuredHtml.isElement(html) &&
    html.containsMarkdown &&
    StructuredHtml.isElement(currentTranslation) &&
    currentTranslation.containsMarkdown;
  const isText =
    StructuredHtml.isText(html) && StructuredHtml.isText(currentTranslation) && text.replace(/\s/g, '').length > 0;

  let originalText: string | undefined;
  let originalValue: string | null | undefined;
  if (isMarkdown) {
    originalText = html.markdown;
    originalValue = currentTranslation.markdown;
  } else if (isText) {
    originalText = text;
    originalValue = currentTranslation.textContent;
  }

  if (isText || isMarkdown) {
    return (
      <TranslationTextInput
        text={originalText}
        value={originalValue?.trim()}
        type={getInputType(originalText ?? '')}
        onBlur={(value: string) => {
          let textContentWithWhiteSpaces = value.trim();
          if (originalText?.startsWith(' ')) {
            textContentWithWhiteSpaces = ` ${textContentWithWhiteSpaces}`;
          }
          if (originalText?.endsWith(' ')) {
            textContentWithWhiteSpaces = `${textContentWithWhiteSpaces} `;
          }

          if (textContentWithWhiteSpaces !== originalValue) {
            updateTranslation({ id: currentTranslation.id, value: textContentWithWhiteSpaces });
          }
        }}
        onChange={undefined}
        hasGlobalTranslation={false}
        tempGlobalTranslation={undefined}
        showGlobalTranslation={false}
        setHasGlobalTranslation={undefined}
        setGlobalTranslation={undefined}
      />
    );
  }

  if (StructuredHtml.isElement(html)) {
    return (
      <div>
        {html.children.map((originalElement, index) => {
          const translationChildren = StructuredHtml.isElement(currentTranslation)
            ? currentTranslation.children
            : undefined;
          return (
            <TranslationFormHtmlInput
              key={`html-translation-${originalElement.id}`}
              text={originalElement.innerText}
              html={originalElement}
              currentTranslation={translationChildren?.[index]}
              updateTranslation={updateTranslation}
            />
          );
        })}
      </div>
    );
  }

  return <></>;
};

export default TranslationFormHtmlInput;
