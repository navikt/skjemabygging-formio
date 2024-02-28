import { HtmlAsJsonElement, HtmlAsJsonTextElement } from '@navikt/skjemadigitalisering-shared-components';
import TranslationTextInput from './TranslationTextInput';
import { getInputType } from './utils';

interface Props {
  text: string;
  htmlElementAsJson?: HtmlAsJsonElement | HtmlAsJsonTextElement;
  currentTranslation: HtmlAsJsonElement | HtmlAsJsonTextElement;
  updateTranslation: (HtmlAsJsonElement) => void;
}

const TranslationFormHtmlInput = ({ text, htmlElementAsJson, currentTranslation, updateTranslation }: Props) => {
  // TODO: if (htmlElementAsJson.type === 'Element' && !['A', 'STRONG', 'B'].includes(htmlElementAsJson.tagName)) {
  if (currentTranslation.type === 'Element') {
    return (
      <div>
        {currentTranslation.children.map((translationElement, index) => {
          const originalTextElement =
            htmlElementAsJson?.type === 'Element' ? htmlElementAsJson.children[index] : undefined;
          return (
            <TranslationFormHtmlInput
              key={`html-translation-${translationElement.id}`}
              text={translationElement['textContent'] ?? ''}
              htmlElementAsJson={originalTextElement}
              currentTranslation={translationElement}
              updateTranslation={(element) => {
                const updatedTranslation = currentTranslation;
                if (updatedTranslation && updatedTranslation?.type === 'Element') {
                  updatedTranslation.children[index] = element;
                }
                updateTranslation(updatedTranslation);
              }}
            />
          );
        })}
      </div>
    );
  }

  if (currentTranslation.type === 'TextElement' && text.replace(/\s/g, '').length > 0) {
    return (
      <TranslationTextInput
        text={text}
        value={currentTranslation?.type === 'TextElement' ? currentTranslation.textContent?.trim() : ''}
        type={getInputType(currentTranslation.textContent ?? '')}
        onChange={(value: string) => {
          let translatedTextWithWhiteSpace = value.trim();
          if (currentTranslation.textContent?.startsWith(' ')) {
            translatedTextWithWhiteSpace = ` ${translatedTextWithWhiteSpace}`;
          }
          if (currentTranslation.textContent?.endsWith(' ')) {
            translatedTextWithWhiteSpace = `${translatedTextWithWhiteSpace} `;
          }
          updateTranslation({
            ...htmlElementAsJson,
            textContent: translatedTextWithWhiteSpace,
          });
        }}
        hasGlobalTranslation={false}
        tempGlobalTranslation={undefined}
        showGlobalTranslation={false}
        setHasGlobalTranslation={undefined}
        setGlobalTranslation={undefined}
      />
    );
  }

  return <></>;
};

export default TranslationFormHtmlInput;
