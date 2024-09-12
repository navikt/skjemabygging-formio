const rowLayout = {
  '.row-layout': {
    display: 'flex',
    width: '100%',
    gap: '1.5rem',
    '&__main': {
      flex: '1 1 100%',
      overflow: 'hidden',
    },
    '&__right, &__left': {
      flex: '0 0 15rem',
    },
  },
};

export default rowLayout;
