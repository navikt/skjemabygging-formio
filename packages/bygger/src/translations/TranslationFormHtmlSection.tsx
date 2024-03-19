import { PlusIcon, XMarkIcon } from '@navikt/aksel-icons';
import { Alert, Box, Button, HStack, Heading, VStack } from '@navikt/ds-react';
import Divider from '@navikt/ds-react/esm/dropdown/Menu/Divider';
import {
  HtmlAsJsonElement,
  HtmlAsJsonTextElement,
  htmlUtils,
  makeStyles,
} from '@navikt/skjemadigitalisering-shared-components';
import { useEffect, useMemo, useState } from 'react';
import TranslationFormHtmlInput from './TranslationFormHtmlInput';

interface Props {
  text: string;
  htmlElementAsJson: HtmlAsJsonElement | HtmlAsJsonTextElement;
  storedTranslation: string;
  updateTranslation: (text: string) => void;
  onSelectLegacy: () => void;
}

const useStyles = makeStyles({
  outerBox: {
    marginBottom: '1rem',
    paddingBottom: 'var(--a-spacing-4)',
  },
  divider: {
    border: '1px solid var(--a-border-divider)',
  },
});

const isSameStructure = (
  elementTreeA?: HtmlAsJsonElement | HtmlAsJsonTextElement,
  elementTreeB?: HtmlAsJsonElement | HtmlAsJsonTextElement,
) => {
  if (!elementTreeA || !elementTreeB) {
    return false;
  }
  if (elementTreeA.type === 'Element' && elementTreeB.type === 'Element') {
    if (elementTreeA.tagName !== elementTreeB.tagName) {
      return false;
    }
    return elementTreeA.children.every((childA, index) => {
      return elementTreeB.children.length > index && isSameStructure(childA, elementTreeB.children[index]);
    });
  }
  return elementTreeA.type === elementTreeB.type;
};

const TranslationFormHtmlSection = ({
  text,
  htmlElementAsJson,
  storedTranslation,
  updateTranslation,
  onSelectLegacy,
}: Props) => {
  const [currentTranslation, setCurrentTranslation] = useState<HtmlAsJsonElement | HtmlAsJsonTextElement>();
  const [currentTranslationWithMarkDown, setCurrentTranslationWithMarkDown] = useState<
    HtmlAsJsonElement | HtmlAsJsonTextElement
  >();

  const translationIsMissing = useMemo(
    () => !currentTranslation && (!storedTranslation || !htmlUtils.isHtmlString(storedTranslation)),
    [currentTranslation, storedTranslation],
  );
  const incompatibleTranslationExists = useMemo(() => {
    if (!currentTranslationWithMarkDown) {
      const storedTranslationAsJson =
        !!storedTranslation && htmlUtils.isHtmlString(storedTranslation)
          ? htmlUtils.htmlString2Json(storedTranslation, ['P', 'H3', 'LI'])
          : undefined;
      return storedTranslationAsJson && !isSameStructure(htmlElementAsJson, storedTranslationAsJson);
    }
  }, [currentTranslationWithMarkDown, htmlElementAsJson, storedTranslation]);

  useEffect(() => {
    if (!currentTranslation && !translationIsMissing && !incompatibleTranslationExists) {
      setCurrentTranslation(htmlUtils.htmlString2Json(storedTranslation));
      setCurrentTranslationWithMarkDown(htmlUtils.htmlString2Json(storedTranslation, ['P', 'H3', 'LI']));
    }
  }, [currentTranslation, incompatibleTranslationExists, storedTranslation, translationIsMissing]);

  const styles = useStyles();

  const startNewTranslation = () => {
    setCurrentTranslation(htmlUtils.htmlString2Json(text));
    setCurrentTranslationWithMarkDown(htmlElementAsJson);
  };

  if (htmlElementAsJson.type === 'Element') {
    return (
      <Box
        data-testid="html-translation"
        className={styles.outerBox}
        padding="2"
        paddingInline="4"
        borderRadius="xlarge"
        background="bg-subtle"
        borderColor="border-default"
        borderWidth="2"
      >
        <div dangerouslySetInnerHTML={{ __html: text }} />
        <Divider />
        {translationIsMissing && (
          <VStack gap="4" align="start">
            <Alert inline size="small" variant="warning">
              Oversettelse mangler. Klikk "Start ny oversettelse" for å legge til ny.
            </Alert>
            <Button size="small" variant="primary" onClick={startNewTranslation} icon={<PlusIcon aria-hidden />}>
              Start ny oversettelse
            </Button>
          </VStack>
        )}
        {incompatibleTranslationExists && (
          <VStack gap="4" align="start">
            <Divider color="border-default" />
            <Heading size={'xsmall'}>Teksten har en eksisterende oversettelse som ikke følger samme struktur</Heading>
            <div dangerouslySetInnerHTML={{ __html: storedTranslation }} />
            <HStack gap="6">
              <Button size="small" variant="secondary" onClick={onSelectLegacy} icon={<XMarkIcon aria-hidden />}>
                Bruk eksisterende oversettelse
              </Button>
              <Button size="small" variant="primary" onClick={startNewTranslation} icon={<PlusIcon aria-hidden />}>
                Start ny oversettelse
              </Button>
            </HStack>
          </VStack>
        )}
        {currentTranslation && (
          <>
            <b>Lagret:</b>
            <div>{storedTranslation}</div>
            <b>Oversett:</b>
            <div
              dangerouslySetInnerHTML={{ __html: htmlUtils.json2HtmlString(currentTranslation as HtmlAsJsonElement) }}
            />
          </>
        )}
        {currentTranslationWithMarkDown?.type === 'Element' &&
          currentTranslation?.type === 'Element' &&
          htmlElementAsJson.type === 'Element' &&
          htmlElementAsJson.children.map((originalElement, index) => {
            const translationElement = currentTranslation.children[index];
            const translationElementWithMarkDown = currentTranslationWithMarkDown.children[index];
            return (
              <TranslationFormHtmlInput
                key={`html-translation-${translationElementWithMarkDown.id}`}
                text={translationElementWithMarkDown['textContent'] ?? ''}
                htmlElementAsJson={originalElement}
                currentTranslation={translationElement}
                currentTranslationWithMarkDown={translationElementWithMarkDown}
                updateTranslation={(element) => {
                  const updatedTranslation = currentTranslation;
                  if (updatedTranslation && updatedTranslation?.type === 'Element') {
                    updatedTranslation.children[index] = element;
                    const updatedTranslationHtmlString = htmlUtils.json2HtmlString(updatedTranslation);
                    const updatedTranslation2Json = htmlUtils.htmlString2Json(updatedTranslationHtmlString, [
                      'P',
                      'H3',
                      'LI',
                    ]);
                    setCurrentTranslation(updatedTranslation);
                    setCurrentTranslationWithMarkDown(updatedTranslation2Json);
                    updateTranslation(updatedTranslationHtmlString);
                  }
                }}
              />
            );
          })}
      </Box>
    );
  }

  return <></>;
};

export default TranslationFormHtmlSection;
