import { Form, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import useFormsApiForms from './useFormsApiForms';

/**
 * Temporary. Created to replace formio. Should be replaced by new FormContexts
 * */
const useForms = () => {
  const {
    getAll,
    get,
    put,
    resetForm,
    post,
    postLockForm,
    deleteLockForm,
    publish,
    unpublish,
    deleteForm,
    getPublished,
    copyFromProd,
  } = useFormsApiForms();

  const loadFormsList = async () => {
    return await getAll('title,path,skjemanummer,properties,changedAt,publishedAt,status,lock');
  };

  const createForm = async (form: Form) => {
    return await post(form);
  };

  const onSave = async (form: Form) => {
    return await put(form);
  };

  const onReset = async (formPath: string, revision: number) => {
    return await resetForm(formPath, revision);
  };

  const onPublish = async (form: Form, languages: TranslationLang[]) => {
    return await publish(form, languages);
  };

  const onUnpublish = async (formPath: string) => {
    return await unpublish(formPath);
  };

  const onDelete = async (form: Form) => {
    return await deleteForm(form);
  };

  const onCopyFromProd = async (formPath: string) => {
    return await copyFromProd(formPath);
  };

  return {
    loadForm: get,
    loadForms: getAll,
    loadFormsList,
    createForm,
    onSave,
    onReset,
    onLockForm: postLockForm,
    onUnlockForm: deleteLockForm,
    onPublish,
    getPublished,
    onUnpublish,
    onDelete,
    onCopyFromProd,
  };
};

export default useForms;
