const sidebarLayout = {
  '.sidebar-layout': {
    position: 'sticky',
    height: 'calc(100vh - 11.5rem)',
    top: '10rem',
    overflowY: 'auto',
    overflowX: 'hidden',
    '&--no-scroll': {
      overflow: 'hidden',
    },
    '&--left': {
      textAlign: 'left',
    },
    '& .navds-button': {
      maxWidth: '12rem',
    },
  },
};

export default sidebarLayout;
