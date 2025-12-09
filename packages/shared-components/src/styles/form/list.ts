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
    paddingLeft: 'var(--a-spacing-5)',
    '& li': {
      marginBottom: 'var(--a-spacing-3)',
      '&:first-child': {
        marginTop: 'var(--a-spacing-3)',
      },
    },
  },
};
export default list;
