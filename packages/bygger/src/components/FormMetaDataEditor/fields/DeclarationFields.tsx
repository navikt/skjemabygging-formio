import { Textarea, ToggleGroup } from '@navikt/ds-react';
import { DeclarationType, Form, FormSettingsDiff, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import LabelWithDiff from '../LabelWithDiff';
import { FormMetadataError, UpdateFormFunction } from '../utils/utils';

export interface DeclarationFieldsProps {
  onChange: UpdateFormFunction;
  diff: FormSettingsDiff;
  form: Form;
  errors?: FormMetadataError;
}

const DeclarationFields = ({ onChange, diff, form, errors }: DeclarationFieldsProps) => {
  const declarationText = form.properties.declarationText;
  const isLockedForm = !!form.lock;

  return (
    <>
      <LabelWithDiff label="Erklæring på oppsummeringsside" diff={!!diff.declarationType} />
      <div className="mb">
        <ToggleGroup
          size="small"
          defaultValue={form.properties.declarationType ?? DeclarationType.none}
          onChange={(value) => {
            const declarationType = value as DeclarationType;
            let properties;
            if (declarationType !== DeclarationType.custom && form.properties.declarationText) {
              properties = { ...form.properties, declarationType, declarationText: undefined };
            } else {
              properties = { ...form.properties, declarationType };
            }

            onChange({
              ...form,
              properties,
            });
          }}
          className="mb-4"
        >
          <ToggleGroup.Item value={DeclarationType.none}>Ingen</ToggleGroup.Item>
          <ToggleGroup.Item value={DeclarationType.default}>Standard</ToggleGroup.Item>
          <ToggleGroup.Item value={DeclarationType.custom}>Tilpasset</ToggleGroup.Item>
        </ToggleGroup>

        {form.properties.declarationType === DeclarationType.custom && (
          <Textarea
            label={<LabelWithDiff label="Tilpasset erklæringstekst" diff={!!diff.declarationText} />}
            value={declarationText || ''}
            onChange={(event) =>
              onChange({
                ...form,
                properties: { ...form.properties, declarationText: event.target.value },
              })
            }
            error={errors?.declarationText}
            readOnly={isLockedForm}
          />
        )}

        {form.properties.declarationType === DeclarationType.default && (
          <div>
            <label className="aksel-label">Standard erklæringstekst</label>
            <div>{TEXTS.statiske.declaration.defaultText}</div>
          </div>
        )}
      </div>
    </>
  );
};

export default DeclarationFields;
