import { Form, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import useFormsApiForms from './useFormsApiForms';

/**
 * Temporary. Created to replace formio. Should be replaced by new FormContexts
 * */
const useForms = () => {
  const { getAll, get, put, post, postLockForm, deleteLockForm, publish, getPublished } = useFormsApiForms();

  const loadFormsList = async () => {
    return await getAll('title,path,skjemanummer,properties,changedAt,publishedAt,status');
  };

  const createForm = async (form: Form) => {
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

  return {
    loadForm: get,
    loadForms: getAll,
    loadFormsList,
    createForm,
    onSave,
    onLockForm: postLockForm,
    onUnlockForm: deleteLockForm,
    onPublish,
    getPublished,
    onUnpublish,
    onCopyFromProd,
  };
};

export default useForms;
