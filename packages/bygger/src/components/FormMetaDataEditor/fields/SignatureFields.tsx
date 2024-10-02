import { Button, Checkbox } from '@navikt/ds-react';
import {
  NavFormSettingsDiff,
  NavFormType,
  NewFormSignatureType,
  signatureUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { v4 as uuidv4 } from 'uuid';
import SignatureComponent from '../../layout/SignatureComponent';
import { UpdateFormFunction } from '../utils/utils';

export interface SignatureFieldsProps {
  onChange: UpdateFormFunction;
  diff: NavFormSettingsDiff;
  form: NavFormType;
}

const SignatureFields = ({ onChange, diff, form }: SignatureFieldsProps) => {
  const signatures = form.properties.signatures || [];
  const descriptionOfSignaturesPositionUnder = form.properties.descriptionOfSignaturesPositionUnder || false;
  const isLockedForm = form.properties.isLockedForm;

  const addExistingSignature = (newSignature: NewFormSignatureType, index: number) =>
    onChange({
      ...form,
      properties: {
        ...form.properties,
        signatures: signatureUtils.mapBackwardCompatibleSignatures(signatures).map((signatureObject, i) => {
          if (index === i) {
            return newSignature;
          } else {
            return signatureObject;
          }
        }),
      },
    });

  const addNewSignature = () =>
    onChange({
      ...form,
      properties: {
        ...form.properties,
        signatures: [
          ...signatureUtils.mapBackwardCompatibleSignatures(signatures),
          {
            label: '',
            description: '',
            key: uuidv4(),
          },
        ],
      },
    });

  const removeSignature = (signatureKey: string) => {
    const mappedSignatures = signatureUtils.mapBackwardCompatibleSignatures(signatures);
    if (mappedSignatures.length > 0) {
      const updatedSignatures = mappedSignatures.filter((s) => s.key !== signatureKey);

      onChange({
        ...form,
        properties: {
          ...form.properties,
          signatures: updatedSignatures,
        },
      });
    }
  };

  return (
    <>
      <Checkbox
        className="mb"
        checked={descriptionOfSignaturesPositionUnder}
        readOnly={isLockedForm}
        onChange={(event) =>
          onChange({
            ...form,
            properties: { ...form.properties, descriptionOfSignaturesPositionUnder: event.target.checked },
          })
        }
      >
        Plasser under signaturer
      </Checkbox>

      {signatureUtils.mapBackwardCompatibleSignatures(signatures)?.map((signature, index) => (
        <div key={signature.key}>
          <SignatureComponent
            signature={signature}
            diff={diff.signatures?.[signature.key]}
            index={index}
            onChange={(newSignature) => addExistingSignature(newSignature, index)}
            onDelete={() => removeSignature(signature.key)}
            readonly={isLockedForm}
          />
        </div>
      ))}

      <Button variant="secondary" className="mb" onClick={addNewSignature} disabled={isLockedForm}>
        Legg til signatur
      </Button>
    </>
  );
};

export default SignatureFields;
