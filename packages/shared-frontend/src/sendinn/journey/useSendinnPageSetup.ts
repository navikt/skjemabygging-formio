import { flattenComponents, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo } from 'react';
import { useFormDefinitionForm } from '../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../context/language/LanguageContext';

const useSendinnPageSetup = () => {
  const { translate } = useLanguage();
  const form = useFormDefinitionForm();
  const hasAttachments = useMemo(
    () => flattenComponents(form.components).some((component) => component.type === 'attachment'),
    [form],
  );
  const formTitle = translate(TEXTS.statiske.sendinn.journey.formTitle, { title: translate(form.title) });

  useEffect(() => {
    document.title = formTitle;
  }, [formTitle]);

  return { formTitle, hasAttachments };
};

export { useSendinnPageSetup };
