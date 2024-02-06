import { FyllutState, MellomlagringError, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { SendInnSoknadResponse } from '../../../api/sendinn/sendInnSoknad';
import { getFyllutMellomlagringState } from '../utils/utils';

type FyllutMellomlagringState = FyllutState['mellomlagring'];
type ErrorType = MellomlagringError['type'];

type MellomlagringAction =
  | {
      type: 'init' | 'update';
      response: SendInnSoknadResponse | undefined;
    }
  | {
      type: 'error';
      error: ErrorType;
    };

export const mellomlagringReducer = (
  state: FyllutMellomlagringState,
  action: MellomlagringAction,
): FyllutMellomlagringState => {
  switch (action.type) {
    case 'init':
    case 'update':
      return { ...state, ...(getFyllutMellomlagringState(action.response) ?? {}), error: undefined };
    case 'error':
      return { ...state, error: getError(action.error, state?.savedDate) };
  }
};

const getError = (type: ErrorType, savedDate?: string): MellomlagringError => {
  switch (type) {
    case 'GET_FAILED':
      return {
        type,
        title: TEXTS.statiske.mellomlagringError.get.title,
        message: TEXTS.statiske.mellomlagringError.get.message,
      };
    case 'CREATE_FAILED':
      return {
        type,
        title: TEXTS.statiske.mellomlagringError.create.title,
        message: TEXTS.statiske.mellomlagringError.create.message,
      };
    case 'UPDATE_FAILED':
      return {
        type,
        title: TEXTS.statiske.mellomlagringError.update.title,
        message: TEXTS.statiske.mellomlagringError.update.message,
      };
    case 'UPDATE_FAILED_NOT_FOUND':
      return {
        type,
        title: TEXTS.statiske.mellomlagringError.updateNotFound.title,
        messageStart: TEXTS.statiske.mellomlagringError.updateNotFound.messageStart,
        messageEnd: TEXTS.statiske.mellomlagringError.updateNotFound.messageEnd,
        linkText: TEXTS.statiske.external.minSide.linkText,
        url: TEXTS.statiske.external.minSide.url,
      };
    case 'DELETE_FAILED':
      return {
        type,
        title: TEXTS.statiske.mellomlagringError.delete.title,
        message: TEXTS.statiske.mellomlagringError.delete.message,
      };
    case 'DELETE_FAILED_NOT_FOUND':
      return {
        type,
        title: TEXTS.statiske.mellomlagringError.deleteNotFound.title,
        messageStart: TEXTS.statiske.mellomlagringError.deleteNotFound.messageStart,
        messageEnd: TEXTS.statiske.mellomlagringError.deleteNotFound.messageEnd,
        linkText: TEXTS.statiske.external.minSide.linkText,
        url: TEXTS.statiske.external.minSide.url,
      };
    case 'SUBMIT_FAILED_NOT_FOUND':
      return {
        type,
        title: TEXTS.statiske.mellomlagringError.submitNotFound.title,
        messageStart: TEXTS.statiske.mellomlagringError.submitNotFound.messageStart,
        messageEnd: TEXTS.statiske.mellomlagringError.submitNotFound.messageEnd,
        linkText: TEXTS.statiske.external.minSide.linkText,
        url: TEXTS.statiske.external.minSide.url,
      };
    case 'SUBMIT_FAILED':
      return {
        type,
        title: TEXTS.statiske.mellomlagringError.submit.title,
        message: TEXTS.statiske.mellomlagringError.submit.draftSaved,
        messageParams: { date: savedDate },
      };
    case 'SUBMIT_AND_UPDATE_FAILED':
      const draftSavedMessage = savedDate
        ? {
            message: TEXTS.statiske.mellomlagringError.submit.draftSaved,
            messageParams: { date: savedDate },
          }
        : {};

      return {
        type,
        title: TEXTS.statiske.mellomlagringError.submit.title,
        message: TEXTS.statiske.mellomlagringError.submit.draftNotSaved,
        ...draftSavedMessage,
      };
  }
};
