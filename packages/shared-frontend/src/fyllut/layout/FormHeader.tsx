import { Box, Heading, Tag } from '@navikt/ds-react';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguage } from '../../context/language/LanguageContext';
import styles from './FormHeader.module.css';
import FormIcon from './FormIcon';

interface Props {
  form: Pick<Form, 'title' | 'skjemanummer' | 'properties'>;
  pageTitle?: string;
}

const FormHeader = ({ form, pageTitle }: Props) => {
  const { translate } = useLanguage();

  return (
    <Box as="header" marginBlock="space-0 space-40" className={styles.header}>
      <span aria-hidden="true" className={styles.icon}>
        <FormIcon />
      </span>
      {pageTitle && (
        <Heading level="1" size="xsmall" textColor="subtle" className={styles.formTitle}>
          {translate(form.title)}
        </Heading>
      )}
      <Heading level={pageTitle ? '2' : '1'} size="xlarge" id="page-title" tabIndex={-1}>
        {translate(pageTitle ?? form.title)}
      </Heading>
      {form.skjemanummer && (
        <Tag data-color="neutral" variant="moderate" size="small">
          {form.skjemanummer}
        </Tag>
      )}
    </Box>
  );
};

export default FormHeader;
