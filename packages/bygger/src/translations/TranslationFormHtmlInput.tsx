import { HtmlObject } from '@navikt/skjemadigitalisering-shared-components';
import TranslationTextInput from './TranslationTextInput';
import { getInputType } from './utils';

interface Props {
  text: string;
  html: HtmlObject;
  currentTranslation?: HtmlObject;
  updateTranslation: (element: { id: string; value: string }) => void;
}

const TranslationFormHtmlInput = ({ text, html, currentTranslation, updateTranslation }: Props) => {
  if (HtmlObject.isElement(html) && !html.containsMarkdown) {
    return (
      <div>
        {html.children.map((originalElement, index) => {
          const translationChildren = HtmlObject.isElement(currentTranslation)
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

  if (
    HtmlObject.isElement(html) &&
    HtmlObject.isElement(currentTranslation) &&
    html.containsMarkdown &&
    currentTranslation.containsMarkdown
  ) {
    const markdown = html.markdown;
    return (
      <TranslationTextInput
        text={markdown}
        value={currentTranslation.markdown}
        type={getInputType(markdown ?? '')}
        onBlur={(value: string) => {
          // TODO: check markdown with surrounding space
          if (value !== currentTranslation.markdown) {
            updateTranslation({ id: currentTranslation.id, value });
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

  if (
    HtmlObject.isTextElement(html) &&
    HtmlObject.isTextElement(currentTranslation) &&
    text.replace(/\s/g, '').length > 0
  ) {
    return (
      <TranslationTextInput
        text={text}
        value={currentTranslation.textContent?.trim()}
        type={getInputType(html.textContent ?? '')}
        onBlur={(value: string) => {
          let textContentWithWhiteSpaces = value.trim();
          if (html.textContent?.startsWith(' ')) {
            textContentWithWhiteSpaces = ` ${textContentWithWhiteSpaces}`;
          }
          if (html.textContent?.endsWith(' ')) {
            textContentWithWhiteSpaces = `${textContentWithWhiteSpaces} `;
          }

          if (textContentWithWhiteSpaces !== currentTranslation.textContent) {
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

  return <></>;
};

export default TranslationFormHtmlInput;
