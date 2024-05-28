import { makeStyles, SkeletonList, useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useEffect, useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { determineStatus } from '../status/FormStatus';
import { FormListType, FormsList } from './FormsList';
import FormsNoResult from './FormsNoResult';

const useStyles = makeStyles({
  root: {
    maxWidth: '80rem',
    margin: '0 auto 2rem',
  },
});

interface FormsListPageProps {
  loadFormsList: () => Promise<NavFormType[]>;
}

const FormsListPage = ({ loadFormsList }: FormsListPageProps) => {
  const styles = useStyles();
  const [loading, setLoading] = useState<boolean>(true);
  const [forms, setForms] = useState<FormListType[]>();
  const { logger } = useAppConfig();

  const loadForms = useCallback(async () => {
    try {
      const navForms = await loadFormsList();
      setForms(navForms.map(mapNavForm));
    } catch (e) {
      try {
        const navForms = await loadFormsList();
        setForms(navForms.map(mapNavForm));
      } catch (e) {
        logger?.error('Could not load forms.');
      }
    } finally {
      setLoading(false);
    }
  }, [loadFormsList]);

  const mapNavForm = (navForm: NavFormType): FormListType => {
    return {
      id: navForm._id ?? '',
      modified: navForm.properties.modified ?? navForm.modified ?? '',
      title: navForm.title?.trim(),
      path: navForm.path,
      number: navForm.properties?.skjemanummer?.trim(),
      status: determineStatus(navForm.properties),
      locked: !!navForm.properties.isLockedForm,
    };
  };

  useEffect(() => {
    (async () => {
      await loadForms();
    })();
  }, [loadForms]);

  return (
    <AppLayout navBarProps={{ formListMenu: true }}>
      <div className={styles.root}>
        {loading ? (
          <SkeletonList size={20} width="100%" height={60} />
        ) : forms ? (
          <FormsList forms={forms} />
        ) : (
          <FormsNoResult />
        )}
      </div>
    </AppLayout>
  );
};

export default FormsListPage;
