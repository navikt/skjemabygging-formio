import classNames from 'classnames';
import React from 'react';

export interface Props {
  children: React.ReactNode;
  noScroll?: boolean;
}

const SidebarLayout = ({ children, noScroll }: Props) => {
  return <div className={classNames('sidebar-layout', { 'sidebar-layout--no-scroll': noScroll })}>{children}</div>;
};

export default SidebarLayout;
