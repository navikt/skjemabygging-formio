import { Skeleton } from '@navikt/ds-react';
import { SkeletonList } from '@navikt/skjemadigitalisering-shared-components';
import { AppLayout } from '../../components/AppLayout';
import RowLayout from '../../components/layout/RowLayout';

export interface Props {
  leftSidebar?: boolean;
  rightSidebar?: boolean;
}

const FormSkeleton = ({ leftSidebar, rightSidebar }: Props) => {
  const headerHeight = '4.5rem';
  return (
    <AppLayout>
      <RowLayout
        left={<Skeleton variant="rectangle" height={headerHeight} />}
        right={<Skeleton variant="rectangle" height={headerHeight} />}
      >
        <Skeleton variant="rectangle" height={headerHeight} />
      </RowLayout>
      <br />
      <RowLayout
        left={leftSidebar && <SkeletonList size={9} height={40} />}
        right={rightSidebar && <SkeletonList size={3} height={40} />}
      >
        <SkeletonList size={1} height={40} />
        <SkeletonList size={10} height={60} />
      </RowLayout>
    </AppLayout>
  );
};

export default FormSkeleton;
