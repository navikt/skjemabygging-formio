import { FormContainer, SkeletonList } from '@navikt/skjemadigitalisering-shared-components';

const FormPageSkeleton = () => {
  return (
    <FormContainer>
      <SkeletonList size={1} height={120} />
      <SkeletonList size={10} height={60} />
    </FormContainer>
  );
};

export default FormPageSkeleton;
