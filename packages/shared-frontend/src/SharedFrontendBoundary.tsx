import type { PropsWithChildren } from 'react';

type SharedFrontendBoundaryProps = PropsWithChildren;

const SharedFrontendBoundary = ({ children }: SharedFrontendBoundaryProps) => children;

export default SharedFrontendBoundary;
export type { SharedFrontendBoundaryProps };
