import { FyllutState, MellomlagringError, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { SendInnSoknadResponse } from '../../api/sendInnSoknad';
import { getFyllutMellomlagringState } from './utils';

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
      return { ...state, error: getError(action.error) };
  }
};

const getError = (type: ErrorType): MellomlagringError => {
  switch (type) {
    case 'NOT FOUND':
      return { type, message: TEXTS.statiske.mellomlagringError.get.notFoundMessage };
    case 'GET FAILED':
      return {
        type,
        title: TEXTS.statiske.mellomlagringError.get.title,
        message: TEXTS.statiske.mellomlagringError.get.message,
      };
    case 'CREATE FAILED':
      return {
        type,
        title: TEXTS.statiske.mellomlagringError.create.title,
        message: TEXTS.statiske.mellomlagringError.create.message,
      };
    case 'UPDATE FAILED':
      return {
        type,
        title: TEXTS.statiske.mellomlagringError.update.title,
        message: TEXTS.statiske.mellomlagringError.update.message,
      };
    case 'DELETE FAILED':
      return {
        type,
        title: TEXTS.statiske.mellomlagringError.delete.title,
        message: TEXTS.statiske.mellomlagringError.delete.message,
      };
    case 'SUBMIT FAILED':
      return {
        type,
        title: TEXTS.statiske.mellomlagringError.submit.title,
        message: TEXTS.statiske.mellomlagringError.submit.draftSaved,
      };
    case 'SUBMIT AND UPDATE FAILED':
      return {
        type,
        title: TEXTS.statiske.mellomlagringError.submit.title,
        message: TEXTS.statiske.mellomlagringError.submit.draftNotSaved,
      };
  }
};
