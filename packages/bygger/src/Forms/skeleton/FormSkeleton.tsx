import { Skeleton } from '@navikt/ds-react';
import { makeStyles, SkeletonList } from '@navikt/skjemadigitalisering-shared-components';
import { AppLayout } from '../../components/AppLayout';
import RowLayout from '../../components/layout/RowLayout';

const useStyles = makeStyles({
  header: {
    marginBottom: 'var(--ax-space-16)',
  },
});

export interface Props {
  leftSidebar?: boolean;
  rightSidebar?: boolean;
}

const FormSkeleton = ({ leftSidebar, rightSidebar }: Props) => {
  const headerHeight = '4.5rem';
  const styles = useStyles();
  return (
    <AppLayout>
      <RowLayout
        className={styles.header}
        left={<Skeleton variant="rectangle" height={headerHeight} />}
        right={<Skeleton variant="rectangle" height={headerHeight} />}
      >
        <Skeleton variant="rectangle" height={headerHeight} />
      </RowLayout>
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
