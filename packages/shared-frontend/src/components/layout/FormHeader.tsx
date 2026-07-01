import { Box, Heading, Tag } from '@navikt/ds-react';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguage } from '../../context/language/LanguageContext';
import styles from './FormHeader.module.css';
import FormIcon from './FormIcon';

interface Props {
  form: Pick<Form, 'title' | 'skjemanummer' | 'properties'>;
  /** Panel/page title displayed as a sub-heading below the form title. */
  pageTitle?: string;
}

/**
 * Form header matching the old shared-components design:
 * - NAV form icon positioned left of the title on wide screens (hidden via CSS module on mobile)
 * - Form title as xsmall/subtle heading when a page title is present
 * - Page/panel title as the main xlarge heading
 * - Skjemanummer tag
 */
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
