import { HtmlAsJsonElement, HtmlAsJsonTextElement, htmlUtils } from '@navikt/skjemadigitalisering-shared-components';
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
        {htmlElementAsJson.children.map((originalTextElement, index) => {
          const translationElement =
            currentTranslation?.type === 'Element' ? currentTranslation.children[index] : undefined;
          return (
            <TranslationFormHtmlInput
              key={`html-translation-${originalTextElement.id}`}
              text={originalTextElement['textContent'] ?? ''}
              htmlElementAsJson={originalTextElement}
              currentTranslation={translationElement}
              updateTranslation={(element: HtmlAsJsonElement) => {
                console.log('updateTranslation', element);
                const updatedTranslation = JSON.parse(JSON.stringify(currentTranslation));
                if (updatedTranslation && updatedTranslation?.type === 'Element') {
                  console.log('-- updateTranslation', { element, updatedTranslation });
                  if (element.tagName === 'DIV') {
                    updatedTranslation.children = element.children;
                  } else {
                    updatedTranslation.children[index] = element;
                  }
                  console.log('-- children', updatedTranslation.children);
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
          let textContentWithWhiteSpaces = value.trim();
          if (htmlElementAsJson.textContent?.startsWith(' ')) {
            textContentWithWhiteSpaces = ` ${textContentWithWhiteSpaces}`;
          }
          if (htmlElementAsJson.textContent?.endsWith(' ')) {
            textContentWithWhiteSpaces = `${textContentWithWhiteSpaces} `;
          }
          // updateTranslation({
          //   ...htmlElementAsJson,
          //   textContent: htmlUtils.markDown2HtmlString(textContentWithWhiteSpaces),
          // });
          console.log('>>Update this text (+original)', textContentWithWhiteSpaces, htmlElementAsJson);
          updateTranslation(htmlUtils.markDown2Json(textContentWithWhiteSpaces, htmlElementAsJson));
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
