import { Form, IntroPage } from '@navikt/skjemadigitalisering-shared-domain';
import { UpdateFormFunction } from '../../../components/FormMetaDataEditor/utils/utils';
import { useFormTranslations } from '../../../context/translations/FormTranslationsContext';
import useKeyBasedText from '../../../hooks/useKeyBasedText';
import { addBulletPoint, handleBulletPointChange, removeBulletPoint, updateSection } from '../utils/utils';
import { IntroPageRefs } from '../validation/useIntroPageRefs';
import { IntroPageError } from '../validation/validation';
import { AddButton } from './AddButton';
import { TextareaField } from './TextareaField';

interface IngressBulletPointRowProps {
  field: keyof IntroPage['sections'];
  form: Form;
  handleChange: UpdateFormFunction;
  errors?: IntroPageError;
  refMap: IntroPageRefs;
  bulletPoints: string[];
  showAddBulletList: boolean;
  showField: boolean;
}

export function IngressBulletPointRow({
  field,
  form,
  handleChange,
  errors,
  refMap,
  bulletPoints,
  showAddBulletList,
  showField,
}: IngressBulletPointRowProps) {
  const { getNBTextForKey } = useFormTranslations();
  const updateKeyBasedText = useKeyBasedText();
  const sectionField = form.introPage?.sections?.[field];
  const isAnExceptionField = ['prerequisites', 'dataDisclosure'].includes(field);

  const onDescriptionChange = (value: string) => {
    const key = updateKeyBasedText(value, 'description');
    updateSection(form, field, 'description', key, handleChange);
  };

  const onBulletPointChange = (value: string, index: number) => {
    const key = updateKeyBasedText(value, `bulletpoint-${index}`);
    handleBulletPointChange(form, field, index, key, handleChange);
  };

  return (
    <>
      {sectionField?.description === undefined && (
        <AddButton
          label="Legg til ingress"
          onClick={() => updateSection(form, field, 'description', '', handleChange)}
        />
      )}

      {!isAnExceptionField && showAddBulletList && (
        <AddButton label="Legg til punktliste" onClick={() => addBulletPoint(form, field, '', handleChange)} />
      )}

      {showField && (
        <TextareaField
          label="Ingress"
          defaultValue={getNBTextForKey(sectionField?.description)}
          onChange={onDescriptionChange}
          showDeleteButton
          onDelete={() => updateSection(form, field, 'description', undefined, handleChange)}
          error={errors?.sections?.[field]?.description}
          ref={refMap[`${field}.description`]}
        />
      )}

      {!!sectionField?.bulletPoints?.length && (
        <>
          {bulletPoints.map((value, index) => (
            <TextareaField
              key={index}
              label="Kulepunkt"
              defaultValue={getNBTextForKey(value)}
              onChange={(value) => onBulletPointChange(value, index)}
              showDeleteButton
              onDelete={() => removeBulletPoint(form, field, index, handleChange)}
              error={errors?.sections?.[field]?.bulletPoints?.[index]}
              ref={refMap[`${field}.bulletPoints`]?.[index]}
            />
          ))}
          <AddButton
            label="Legg til kulepunkt"
            variant="tertiary"
            onClick={() => addBulletPoint(form, field, '', handleChange)}
          />
        </>
      )}

      {isAnExceptionField && bulletPoints?.length === 0 && (
        <AddButton
          label={'Legg til kulepunkt'}
          variant="tertiary"
          onClick={() => addBulletPoint(form, 'prerequisites', '', handleChange)}
        />
      )}
    </>
  );
}
