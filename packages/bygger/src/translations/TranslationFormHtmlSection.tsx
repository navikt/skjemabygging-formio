import { PlusIcon, XMarkIcon } from '@navikt/aksel-icons';
import { Alert, Box, Button, HStack, Heading, HelpText, VStack } from '@navikt/ds-react';
import {
  StructuredHtml,
  StructuredHtmlElement,
  htmlConverter,
  makeStyles,
} from '@navikt/skjemadigitalisering-shared-components';
import { useEffect, useMemo, useRef, useState } from 'react';
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

const TranslationFormHtmlSection = ({ text, storedTranslation, updateTranslation, onSelectLegacy }: Props) => {
  const translationObject = useRef<StructuredHtmlElement>();
  const [translationReady, setTranslationReady] = useState(false);

  const html = useMemo(
    () =>
      htmlConverter.isHtmlString(text)
        ? new StructuredHtmlElement(text, { skipConversionWithin: ['H3', 'P', 'LI'] })
        : undefined,
    [text],
  );

  const translationIsMissing = useMemo(
    () => !translationObject.current && (!storedTranslation || !htmlConverter.isHtmlString(storedTranslation)),
    [storedTranslation],
  );

  const incompatibleTranslationExists = useMemo(() => {
    if (!translationObject.current) {
      return !html?.matches(new StructuredHtmlElement(storedTranslation, { skipConversionWithin: ['H3', 'P', 'LI'] }));
    }
  }, [html, storedTranslation]);

  useEffect(() => {
    if (!translationObject.current && !translationIsMissing && !incompatibleTranslationExists) {
      translationObject.current = new StructuredHtmlElement(storedTranslation, {
        skipConversionWithin: ['H3', 'P', 'LI'],
      });
      setTranslationReady(true);
    }
  }, [incompatibleTranslationExists, storedTranslation, translationIsMissing]);

  const styles = useStyles();

  const startNewTranslation = () => {
    translationObject.current = new StructuredHtmlElement(text, {
      skipConversionWithin: ['H3', 'P', 'LI'],
      withEmptyTextContent: true,
    });
    setTranslationReady(true);
  };

  if (StructuredHtml.isElement(html)) {
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

        {translationReady &&
          html.children.map((originalElement, index) => {
            const translationChild = translationObject.current?.children[index];
            return (
              <TranslationFormHtmlInput
                key={`html-translation-${originalElement.id}`}
                text={originalElement.innerText}
                html={originalElement}
                currentTranslation={translationChild}
                updateTranslation={({ id, value }) => {
                  if (translationObject.current) {
                    if (id) {
                      translationObject.current.update(id, value);
                    } else {
                      throw Error("Can't update translation without an id");
                    }
                    const htmlString = translationObject.current.toHtmlString();
                    updateTranslation(htmlString);
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
