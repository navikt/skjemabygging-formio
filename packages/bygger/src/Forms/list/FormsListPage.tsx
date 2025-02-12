import { SkeletonList, useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useEffect, useState } from 'react';
import useForms from '../../api/useForms';
import { AppLayout } from '../../components/AppLayout';
import RowLayout from '../../components/layout/RowLayout';
import { determineStatusFromForm } from '../status/utils';
import FormError from './../error/FormError';
import { FormListType, FormsList } from './FormsList';

const FormsListPage = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [forms, setForms] = useState<FormListType[]>();
  const { logger } = useAppConfig();
  const { loadFormsList } = useForms();

  const loadForms = useCallback(async () => {
    if (loading) {
      try {
        const forms = await loadFormsList();
        setForms(forms.map(mapFormToFormListType));
      } catch (_e) {
        logger?.error('Could not load forms.');
      } finally {
        setLoading(false);
      }
    }
  }, [loadFormsList, logger, loading]);

  const mapFormToFormListType = (form: Form): FormListType => {
    return {
      id: `${form.id}`,
      modified: form.changedAt ?? form.properties.modified ?? '',
      title: form.title?.trim(),
      path: form.path,
      number: form?.skjemanummer?.trim(),
      status: determineStatusFromForm(form),
      locked: !!form.properties.isLockedForm,
    };
  };

  useEffect(() => {
    (async () => {
      await loadForms();
    })();
  }, [loadForms]);

  return (
    <AppLayout navBarProps={{ formListMenu: true }}>
      <RowLayout fullWidth={true}>
        {loading ? (
          <SkeletonList size={20} width="100%" height={60} />
        ) : forms ? (
          <FormsList forms={forms} />
        ) : (
          <FormError type="FORMS_ERROR" layout={false} />
        )}
      </RowLayout>
    </AppLayout>
  );
};

export default FormsListPage;
