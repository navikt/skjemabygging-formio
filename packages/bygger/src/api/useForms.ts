import { Form, NavFormType, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import useFormsApiForms from './useFormsApiForms';

/**
 * Temporary. Created to replace formio. Should be replaced by new FormContexts
 * */
const useForms = () => {
  const { getAll, get, put, post, publish } = useFormsApiForms();

  const createForm = async (form: NavFormType) => {
    return await post(form);
  };

  const onSave = async (form: Form) => {
    return await put(form);
  };

  const onPublish = async (form: Form, languages: TranslationLang[]) => {
    return await publish(form, languages);
  };

  const onUnpublish = (_form) => {};

  const onCopyFromProd = (_form) => {};

  const onUpdateFormSettings = (_path, _properties) => {};

  return {
    loadForm: get,
    loadFormsList: getAll,
    createForm,
    onSave,
    onPublish,
    onUnpublish,
    onCopyFromProd,
    onUpdateFormSettings,
  };
};

export default useForms;
