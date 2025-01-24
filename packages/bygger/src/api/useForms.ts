import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import useFormsApiForms from './useFormsApiForms';

/**
 * Temporary. Created to replace formio. Should be replaced by new FormContexts
 * */
const useForms = () => {
  const { getAll, get, put, post } = useFormsApiForms();

  const createForm = async (form: NavFormType) => {
    return await post(form);
  };

  const onSave = async (form: NavFormType) => {
    return await put(form);
  };

  const onPublish = (_form, _translations) => {};

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
