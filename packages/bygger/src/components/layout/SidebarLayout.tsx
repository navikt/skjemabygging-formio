import clsx from 'clsx';
import React from 'react';

export interface Props {
  children: React.ReactNode;
  noScroll?: boolean;
}

const SidebarLayout = ({ children, noScroll }: Props) => {
  return <div className={clsx('sidebar-layout', { 'sidebar-layout--no-scroll': noScroll })}>{children}</div>;
};

export default SidebarLayout;
