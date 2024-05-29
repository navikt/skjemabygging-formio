import { Skeleton, SkeletonProps } from '@navikt/ds-react';

interface Props extends SkeletonProps {
  size: number;
}

const SkeletonList = ({ size, variant = 'text', height, width }: Props) => {
  return [...Array(size)].map((x, i) => <Skeleton key={i} variant={variant} width={width} height={height} />);
};

export default SkeletonList;
