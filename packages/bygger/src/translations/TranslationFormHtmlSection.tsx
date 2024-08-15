import { ArrowUndoIcon, PlusIcon, XMarkIcon } from '@navikt/aksel-icons';
import { Box, Button, HStack, Heading, HelpText, VStack } from '@navikt/ds-react';
import {
  InnerHtml,
  StructuredHtml,
  StructuredHtmlElement,
  htmlConverter,
  makeStyles,
} from '@navikt/skjemadigitalisering-shared-components';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFeedbackEmit } from '../context/notifications/FeedbackContext';
import TranslationFormHtmlInput from './TranslationFormHtmlInput';

interface Props {
  text: string;
  storedTranslation: string;
  updateTranslation: (text: string) => void;
  onSelectLegacy: () => void;
}

type TranslationState = { ready: boolean; incompatible?: string; current?: string };

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
  const feedbackEmit = useFeedbackEmit();
  const [translationState, setTranslationState] = useState<TranslationState>({ ready: false });
  const [translationObject, setTranslationObject] = useState<StructuredHtmlElement>();

  const originalLanguageHtml = useMemo(
    () =>
      htmlConverter.isHtmlString(text)
        ? new StructuredHtmlElement(text, { skipConversionWithin: htmlConverter.defaultLeaves })
        : undefined,
    [text],
  );

  const originalHtmlNoContent = useMemo(
    () =>
      new StructuredHtmlElement(text, {
        skipConversionWithin: htmlConverter.defaultLeaves,
        withEmptyTextContent: true,
      }),
    [text],
  );

  const startNewTranslation = useCallback(() => {
    setTranslationObject(originalHtmlNoContent);
    setTranslationState((state) => ({ ...state, ready: true }));
  }, [originalHtmlNoContent]);

  useEffect(() => {
    if (storedTranslation !== translationState.current && !translationState.incompatible) {
      setTranslationState((state) => ({ ...state, current: storedTranslation }));
      if (!storedTranslation) {
        startNewTranslation();
      } else if (
        !originalLanguageHtml?.matches(
          new StructuredHtmlElement(storedTranslation, { skipConversionWithin: htmlConverter.defaultLeaves }),
        )
      ) {
        setTranslationState((state) => ({ ...state, incompatible: storedTranslation, ready: false }));
      } else {
        setTranslationObject(
          new StructuredHtmlElement(storedTranslation, {
            skipConversionWithin: htmlConverter.defaultLeaves,
          }),
        );
        setTranslationState((state) => ({ ...state, ready: true }));
      }
    }
  }, [translationObject, originalLanguageHtml, startNewTranslation, storedTranslation, translationState]);

  const styles = useStyles();

  const onUpdate = ({ id, value }: { id?: string; value: string }, originalElement: StructuredHtml) => {
    if (translationObject) {
      if (id) {
        try {
          if (value === '') {
            const originalValue = StructuredHtml.isElement(originalElement)
              ? originalElement.toJson({ noContent: true })
              : '';
            translationObject.update(id, originalValue);
          } else {
            translationObject.update(id, value);
          }
        } catch (error: any) {
          feedbackEmit.error(error?.message ?? `Det oppsto en feil: ${error}`);
        }
      } else {
        feedbackEmit.error('Det oppsto en feil. Oversettelsen kan ikke oppdateres fordi den mangler id.');
      }

      if (translationObject.innerText === '') {
        updateTranslation('');
      } else {
        const htmlString = translationObject.toHtmlString();
        updateTranslation(htmlString);
      }
    }
  };

  if (StructuredHtml.isElement(originalLanguageHtml)) {
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
        {translationState.incompatible && !translationState.ready && (
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

        {translationState.incompatible && translationState.ready && (
          <Button
            className="mb-4"
            type="button"
            size="small"
            variant="secondary"
            onClick={() => {
              updateTranslation(translationState.incompatible!);
              setTranslationState((state) => ({ ...state, ready: false }));
            }}
            icon={<ArrowUndoIcon aria-hidden />}
          >
            Forkast og gå tilbake
          </Button>
        )}

        {translationState.ready &&
          translationObject &&
          originalLanguageHtml.children.map((originalElement, index) => {
            return (
              <TranslationFormHtmlInput
                key={`html-translation-${originalElement.id}`}
                text={originalElement.innerText}
                html={originalElement}
                currentTranslation={translationObject?.children[index]}
                updateTranslation={(event) => onUpdate(event, originalElement)}
              />
            );
          })}
      </Box>
    );
  }

  return <></>;
};

export default TranslationFormHtmlSection;
