import { PlusIcon, XMarkIcon } from '@navikt/aksel-icons';
import { Alert, Box, Button, HStack, Heading, HelpText, VStack } from '@navikt/ds-react';
import {
  HtmlAsJsonElement,
  HtmlAsJsonTextElement,
  HtmlElement,
  HtmlObject,
  htmlAsJsonUtils,
  makeStyles,
} from '@navikt/skjemadigitalisering-shared-components';
import { useEffect, useMemo, useRef } from 'react';
import TranslationFormHtmlInput from './TranslationFormHtmlInput';

interface Props {
  text: string;
  storedTranslation: string;
  updateTranslation: (text: string) => void;
  onSelectLegacy: () => void;
}

const useStyles = makeStyles({
  outerBox: {
    marginBottom: '1rem',
    paddingBottom: 'var(--a-spacing-4)',
  },
  markdownExample: {
    display: 'grid',
    gridTemplateColumns: '1fr 4fr',
  },
  divider: {
    margin: 'var(--a-spacing-3) 0',
    border: 'none',
    borderBottom: '1px solid var(--a-border-divider)',
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

const TranslationFormHtmlSection = ({ text, storedTranslation, updateTranslation, onSelectLegacy }: Props) => {
  const translationObject = useRef<HtmlElement>();

  const html = useMemo(
    () =>
      htmlAsJsonUtils.isHtmlString(text)
        ? new HtmlElement(htmlAsJsonUtils, text, undefined, undefined, { skipConversionWithin: ['H3', 'P', 'LI'] })
        : undefined,
    [text],
  );

  const translationIsMissing = useMemo(
    () => !translationObject.current && (!storedTranslation || !htmlAsJsonUtils.isHtmlString(storedTranslation)),
    [storedTranslation],
  );

  const incompatibleTranslationExists = useMemo(() => {
    if (!translationObject.current) {
      const storedTranslationAsJson =
        !!storedTranslation && htmlAsJsonUtils.isHtmlString(storedTranslation)
          ? htmlAsJsonUtils.htmlString2Json(storedTranslation, htmlAsJsonUtils.defaultLeafs)
          : undefined;
      return storedTranslationAsJson && !isSameStructure(html?.getJson(), storedTranslationAsJson);
    }
  }, [html, storedTranslation]);

  useEffect(() => {
    if (!translationObject.current && !translationIsMissing && !incompatibleTranslationExists) {
      translationObject.current = new HtmlElement(htmlAsJsonUtils, storedTranslation, undefined, undefined, {
        skipConversionWithin: ['H3', 'P', 'LI'],
      });
    }
  }, [incompatibleTranslationExists, storedTranslation, translationIsMissing]);

  const styles = useStyles();

  const startNewTranslation = () => {
    translationObject.current = new HtmlElement(htmlAsJsonUtils, text, undefined, undefined, {
      skipConversionWithin: ['H3', 'P', 'LI'],
    });
  };

  if (HtmlObject.isElement(html)) {
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
        <HStack justify="space-between" wrap={false}>
          <div dangerouslySetInnerHTML={{ __html: text }} />
          <HelpText title="Hjelp til bruk av markdown" placement="bottom">
            <p>Oversettelser av html bruker markdown til lenker og fet skrift.</p>
            Lenker skrives med klammer rundt lenketeksten etterfulgt av en url omgitt av parenteser
            <Box className="mb-4" padding="4" background="surface-default" borderRadius="large">
              <div className={styles.markdownExample}>
                Eksempel: <div>[lenketekst til Nav](https://www.nav.no)</div>
                Resultat: <a href={'https://www.nav.no'}>lenketekst til Nav</a>
              </div>
            </Box>
            Fet skrift markeres med to stjerner (**) før og etter
            <Box padding="4" background="surface-default" borderRadius="large">
              <div className={styles.markdownExample}>
                Eksempel: <div>Vanlig tekst etterfulgt av **fet tekst**</div>
                Resultat:
                <div>
                  Vanlig tekst etterfulgt av <strong>fet tekst</strong>
                </div>
              </div>
            </Box>
          </HelpText>
        </HStack>
        <hr className={styles.divider} />
        {translationIsMissing && (
          <VStack gap="4" align="start">
            <Alert inline size="small" variant="warning">
              Oversettelse mangler. Klikk "Start ny oversettelse" for å legge til ny.
            </Alert>
            <Button
              type="button"
              size="small"
              variant="primary"
              onClick={startNewTranslation}
              icon={<PlusIcon aria-hidden />}
            >
              Start ny oversettelse
            </Button>
          </VStack>
        )}
        {incompatibleTranslationExists && (
          <VStack gap="4" align="start">
            <hr className={styles.divider} />
            <Heading size={'xsmall'}>Teksten har en eksisterende oversettelse som ikke følger samme struktur</Heading>
            <div dangerouslySetInnerHTML={{ __html: storedTranslation }} />
            <HStack gap="6">
              <Button
                type="button"
                size="small"
                variant="secondary"
                onClick={onSelectLegacy}
                icon={<XMarkIcon aria-hidden />}
              >
                Bruk eksisterende oversettelse
              </Button>
              <Button
                type="button"
                size="small"
                variant="primary"
                onClick={startNewTranslation}
                icon={<PlusIcon aria-hidden />}
              >
                Start ny oversettelse
              </Button>
            </HStack>
          </VStack>
        )}

        {HtmlObject.isElement(translationObject.current) &&
          // TODO: test html.containsMarkdown
          html.children.map((originalElement, index) => {
            const translationElement = translationObject.current?.children[index];
            return (
              <TranslationFormHtmlInput
                key={`html-translation-${originalElement.id}`}
                text={originalElement.innerText}
                html={originalElement}
                currentTranslation={translationElement}
                updateTranslation={({ id, value }) => {
                  if (translationObject.current) {
                    translationObject.current.update(id, value);
                    const htmlString = translationObject.current.toHtmlString();
                    updateTranslation(htmlString);
                  }
                  // const updatedTranslationRoot = updatedTranslationHtmlObject.getRoot();
                  // // setCurrentTranslation(updatedTranslationRoot);
                  // const htmlString = updatedTranslationRoot.toHtmlString();
                  // updateTranslation(htmlString);
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
