import { SkeletonList } from '@navikt/skjemadigitalisering-shared-components';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useEffect, useState } from 'react';
import useForms from '../../api/useForms';
import { AppLayout } from '../../components/AppLayout';
import RowLayout from '../../components/layout/RowLayout';
import { determineStatus } from '../status/FormStatus';
import FormError from './../error/FormError';
import { FormListType, FormsList } from './FormsList';

const FormsListPage = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [forms, setForms] = useState<FormListType[]>();
  const { loadFormsList } = useForms();

  const loadForms = useCallback(async () => {
    if (loading) {
      try {
        const navForms = await loadFormsList('title,path,properties,changedAt');
        setForms(navForms.map(mapNavForm));
      } finally {
        setLoading(false);
      }
    }
  }, [loadFormsList, loading]);

  const mapNavForm = (form: Form): FormListType => {
    return {
      id: `${form.id}`,
      modified: form.changedAt ?? form.properties.modified ?? '',
      title: form.title?.trim(),
      path: form.path,
      number: form.properties?.skjemanummer?.trim(),
      status: determineStatus(form.properties),
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
