import editFormTranslationsReducer, { FormTranslationState } from './editFormTranslationsReducer';
import editGlobalTranslationsReducer, { GlobalTranslationState } from './editGlobalTranslationsReducer';

type State = FormTranslationState | GlobalTranslationState;

export { editFormTranslationsReducer, editGlobalTranslationsReducer };
export type { GlobalTranslationState, State };
