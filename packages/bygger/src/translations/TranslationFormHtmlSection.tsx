import { ArrowUndoIcon, PlusIcon, XMarkIcon } from '@navikt/aksel-icons';
import { Box, Button, HStack, Heading, HelpText, VStack } from '@navikt/ds-react';
import {
  InnerHtml,
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
    marginBottom: 'var(--a-spacing-8)',
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
  const [incompatibleTranslation, setIncompatibleTranslation] = useState<string>();

  const startNewTranslation = () => {
    translationObject.current = new StructuredHtmlElement(text, {
      skipConversionWithin: htmlConverter.defaultLeaves,
      withEmptyTextContent: true,
    });
    setTranslationReady(true);
  };

  const html = useMemo(
    () =>
      htmlConverter.isHtmlString(text)
        ? new StructuredHtmlElement(text, { skipConversionWithin: htmlConverter.defaultLeaves })
        : undefined,
    [text],
  );

  useEffect(() => {
    if (!translationObject.current && !incompatibleTranslation) {
      if (!storedTranslation) {
        startNewTranslation();
      } else if (
        !html?.matches(
          new StructuredHtmlElement(storedTranslation, { skipConversionWithin: htmlConverter.defaultLeaves }),
        )
      ) {
        setIncompatibleTranslation(storedTranslation);
      } else {
        translationObject.current = new StructuredHtmlElement(storedTranslation, {
          skipConversionWithin: htmlConverter.defaultLeaves,
        });
        setTranslationReady(true);
      }
    }
  }, [html, incompatibleTranslation, startNewTranslation, storedTranslation]);

  const styles = useStyles();

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
          <InnerHtml content={text} />
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
        {incompatibleTranslation && !translationReady && (
          <VStack gap="4" align="start">
            <hr className={styles.divider} />
            <Heading size={'xsmall'}>Teksten har en eksisterende oversettelse som ikke følger samme struktur</Heading>
            <InnerHtml content={storedTranslation} />
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

        {incompatibleTranslation && translationReady && (
          <Button
            className="mb-4"
            type="button"
            size="small"
            variant="secondary"
            onClick={() => {
              updateTranslation(incompatibleTranslation);
              setTranslationReady(false);
            }}
            icon={<ArrowUndoIcon aria-hidden />}
          >
            Forkast og gå tilbake
          </Button>
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
