import { ArrowUndoIcon } from '@navikt/aksel-icons';
import { Button, LinkCard, VStack } from '@navikt/ds-react';
import { useAppConfig, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { Form, SubmissionMethod, submissionTypesUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { MouseEvent, useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

enum SelectionState {
  DEFAULT = 'default',
  NO_LOGIN = 'no_login',
}

interface Props {
  form: Form;
}

const SubmissionMethodSelection = ({ form }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { config } = useAppConfig();
  const { translate } = useLanguages();
  const [state, setState] = useState<SelectionState>(SelectionState.DEFAULT);
  const submissionTypes = form.properties.submissionTypes;
  const isLoggedIn = config?.isLoggedIn === true;

  const searchWithSub = useCallback(
    (submissionMethod: SubmissionMethod) => {
      const searchParams = new URLSearchParams(location.search);
      searchParams.set('sub', submissionMethod);
      return `?${searchParams.toString()}`;
    },
    [location.search],
  );

  const startFlow = useCallback(
    (submissionMethod: SubmissionMethod) => {
      const search = searchWithSub(submissionMethod);

      if (submissionMethod === 'digital' && !isLoggedIn) {
        window.location.href = `${window.location.origin}/fyllut/${form.path}${search}`;
        return;
      }

      if (submissionMethod === 'digitalnologin') {
        navigate({ pathname: `/${form.path}/legitimasjon`, search });
        return;
      }

      navigate({ pathname: `/${form.path}`, search });
    },
    [form.path, isLoggedIn, navigate, searchWithSub],
  );

  const preventDefault = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  useEffect(() => {
    if (submissionTypesUtils.isPaperSubmissionOnly(submissionTypes)) {
      startFlow('paper');
    } else if (submissionTypesUtils.isDigitalSubmissionOnly(submissionTypes)) {
      startFlow('digital');
    } else if (submissionTypesUtils.isDigitalNoLoginSubmissionOnly(submissionTypes)) {
      startFlow('digitalnologin');
    } else if (submissionTypesUtils.isPaperNoCoverPageSubmissionOnly(submissionTypes)) {
      startFlow('papernocoverpage');
    }
  }, [startFlow, submissionTypes]);

  const showDigital = state === SelectionState.DEFAULT && submissionTypesUtils.isDigitalSubmission(submissionTypes);
  const showNoLogin =
    state === SelectionState.DEFAULT &&
    submissionTypesUtils.isPaperSubmission(submissionTypes) &&
    submissionTypesUtils.isDigitalSubmission(submissionTypes) &&
    submissionTypesUtils.isDigitalNoLoginSubmission(submissionTypes);
  const showDigitalNoLogin =
    submissionTypesUtils.isDigitalNoLoginSubmission(submissionTypes) &&
    (state === SelectionState.NO_LOGIN ||
      (state === SelectionState.DEFAULT &&
        (!submissionTypesUtils.isDigitalSubmission(submissionTypes) ||
          !submissionTypesUtils.isPaperSubmission(submissionTypes))));
  const showPaper =
    submissionTypesUtils.isPaperSubmission(submissionTypes) &&
    (state === SelectionState.NO_LOGIN ||
      (state === SelectionState.DEFAULT &&
        (!submissionTypesUtils.isDigitalSubmission(submissionTypes) ||
          !submissionTypesUtils.isDigitalNoLoginSubmission(submissionTypes))));

  return (
    <VStack gap="space-4">
      {showDigital && (
        <LinkCard>
          <LinkCard.Title>
            <LinkCard.Anchor
              href={`/fyllut/${form.path}${searchWithSub('digital')}`}
              onClick={(event) => {
                preventDefault(event);
                startFlow('digital');
              }}
            >
              {translate(
                isLoggedIn ? TEXTS.grensesnitt.introPage.sendDigitalLoggedIn : TEXTS.grensesnitt.introPage.sendDigital,
              )}
            </LinkCard.Anchor>
          </LinkCard.Title>
          <LinkCard.Description>{translate(TEXTS.grensesnitt.introPage.sendDigitalDescription)}</LinkCard.Description>
        </LinkCard>
      )}
      {showNoLogin && (
        <LinkCard>
          <LinkCard.Title>
            <LinkCard.Anchor
              href={`/fyllut/${form.path}`}
              onClick={(event) => {
                preventDefault(event);
                setState(SelectionState.NO_LOGIN);
              }}
            >
              {translate(TEXTS.grensesnitt.introPage.noLogin)}
            </LinkCard.Anchor>
          </LinkCard.Title>
          <LinkCard.Description>{translate(TEXTS.grensesnitt.introPage.noLoginDescription)}</LinkCard.Description>
        </LinkCard>
      )}
      {showDigitalNoLogin && (
        <LinkCard>
          <LinkCard.Title>
            <LinkCard.Anchor
              href={`/fyllut/${form.path}/legitimasjon${searchWithSub('digitalnologin')}`}
              onClick={(event) => {
                preventDefault(event);
                startFlow('digitalnologin');
              }}
            >
              {translate(TEXTS.grensesnitt.introPage.sendDigitalNoLogin)}
            </LinkCard.Anchor>
          </LinkCard.Title>
          <LinkCard.Description>
            {translate(TEXTS.grensesnitt.introPage.sendDigitalNoLoginDescription)}
          </LinkCard.Description>
        </LinkCard>
      )}
      {showPaper && (
        <LinkCard>
          <LinkCard.Title>
            <LinkCard.Anchor
              href={`/fyllut/${form.path}${searchWithSub('paper')}`}
              onClick={(event) => {
                preventDefault(event);
                startFlow('paper');
              }}
            >
              {translate(TEXTS.grensesnitt.introPage.sendOnPaper)}
            </LinkCard.Anchor>
          </LinkCard.Title>
          <LinkCard.Description>{translate(TEXTS.grensesnitt.introPage.sendOnPaperDescription)}</LinkCard.Description>
        </LinkCard>
      )}
      {state === SelectionState.NO_LOGIN && (
        <Button
          variant="tertiary"
          icon={<ArrowUndoIcon aria-hidden />}
          onClick={() => setState(SelectionState.DEFAULT)}
        >
          {translate(TEXTS.grensesnitt.introPage.changeSubmissionMethod)}
        </Button>
      )}
    </VStack>
  );
};

export default SubmissionMethodSelection;
