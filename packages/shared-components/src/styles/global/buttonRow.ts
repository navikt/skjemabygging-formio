const buttonRow = {
  '.button-row': {
    display: 'flex',
    flexDirection: 'row-reverse',
    justifyContent: 'flex-end',
    gap: 'var(--a-spacing-5)',
    flexWrap: 'wrap',
    '@media (max-width: 600px)': {
      flexDirection: 'column',
      '> button, & a': {
        minWidth: '100%',
        maxWidth: '100%',
      },
    },
    marginBottom: 'var(--a-spacing-5)',
    '> button, & a': {
      flexGrow: 1,
      minWidth: '12rem',
      maxWidth: '18.75rem',
    },
    '&__center': {
      justifyContent: 'center',
      '@media (max-width: var(--a-breakpoint-md-down))': {
        justifyContent: 'flex-end',
      },
    },
    '&__auto-align': {
      justifyContent: 'flex-end',
    },
  },
};

export default buttonRow;
