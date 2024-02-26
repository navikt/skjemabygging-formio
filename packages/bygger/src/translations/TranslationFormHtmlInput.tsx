import { HtmlAsJsonElement, HtmlAsJsonTextElement } from '@navikt/skjemadigitalisering-shared-components';
import TranslationTextInput from './TranslationTextInput';
import { getInputType } from './utils';

interface Props {
  text: string;
  htmlElementAsJson: HtmlAsJsonElement | HtmlAsJsonTextElement;
  currentTranslation?: HtmlAsJsonElement | HtmlAsJsonTextElement;
  updateTranslation: (HtmlAsJsonElement) => void;
}

const TranslationFormHtmlInput = ({ text, htmlElementAsJson, currentTranslation, updateTranslation }: Props) => {
  if (htmlElementAsJson.type === 'Element') {
    return (
      <div>
        {htmlElementAsJson.children.map((element, index) => {
          const translationChild =
            currentTranslation?.type === 'Element' ? currentTranslation.children[index] : undefined;
          return (
            <TranslationFormHtmlInput
              key={`html-translation-${element.id}`}
              text={element['textContent'] ?? ''}
              htmlElementAsJson={element}
              currentTranslation={translationChild}
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

  if (htmlElementAsJson.type === 'TextElement' && text.replace(/\s/g, '').length > 0) {
    return (
      <TranslationTextInput
        text={text}
        value={currentTranslation?.type === 'TextElement' ? currentTranslation.textContent?.trim() : ''}
        type={getInputType(htmlElementAsJson.textContent ?? '')}
        onChange={(value: string) => {
          let translatedTextWithWhiteSpace = value.trim();
          if (htmlElementAsJson.textContent?.startsWith(' ')) {
            translatedTextWithWhiteSpace = ` ${translatedTextWithWhiteSpace}`;
          }
          if (htmlElementAsJson.textContent?.endsWith(' ')) {
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
