import { guid } from "@navikt/skjemadigitalisering-shared-components";

const createNewRow = (originalText = "", translatedText = "") => ({
  id: guid(),
  originalText,
  translatedText,
});

type ReducerActionType = { type: string; payload: any };

const getCurrenttranslationsReducer = (state: Array<any>, action: ReducerActionType) => {
  switch (action.type) {
    case "initializeLanguage": {
      return [createNewRow()];
    }
    case "loadNewLanguage": {
      const newState = Object.keys(action.payload.translations).map((originalText) => ({
        id: guid(),
        originalText,
        translatedText: action.payload.translations[originalText].value,
      }));
      if (newState.length > 0) {
        return newState;
      } else {
        return [createNewRow()];
      }
    }
    case "updateOriginalText": {
      return state.map((translationObject) => {
        if (translationObject.id === action.payload.id) {
          return {
            ...translationObject,
            originalText: action.payload.newOriginalText,
          };
        } else {
          return translationObject;
        }
      });
    }
    case "updateTranslation": {
      const { id, originalText, translatedText } = action.payload;
      if (id === "") {
        return [...state, createNewRow(originalText, translatedText)];
      }
      return state.map((translation) => (translation.id === id ? action.payload : translation));
    }
    case "addNewTranslation": {
      return [...state, createNewRow()];
    }
    case "deleteOneRow": {
      const newState = state.filter((translationObject) => translationObject.id !== action.payload.id);
      if (newState.length > 0) {
        return newState;
      } else {
        return [createNewRow()];
      }
    }
    default: {
      if (state.length > 0) {
        return state;
      } else {
        return [createNewRow()];
      }
    }
  }
};

export default getCurrenttranslationsReducer;
