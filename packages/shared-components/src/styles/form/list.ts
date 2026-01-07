const list = {
  '& dl': {
    marginTop: 0,
    '& > dt': {
      fontWeight: 700,
    },
    '& > dd': {
      marginBottom: '.5rem',
      marginLeft: 0,
    },
  },
  '& ol, & ul:not(.aksel-combobox__list-options):not(.aksel-combobox__selected-options)': {
    marginTop: 0,
    paddingLeft: 'var(--ax-space-20)',
    '& li': {
      marginBottom: 'var(--ax-space-12)',
      '&:first-child': {
        marginTop: 'var(--ax-space-12)',
      },
    },
  },
};
export default list;
