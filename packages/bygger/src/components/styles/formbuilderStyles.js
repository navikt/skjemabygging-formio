const formBuilderStyles = {
  '.formbuilder': {
    position: 'relative',

    '@media screen and (min-width: 40rem)': {
      height: 'calc(100vh - 16.5rem)',
      display: 'grid',
      gridTemplateColumns: '12.875rem minmax(20rem, 50rem)',
      gridGap: '1.5rem',
      alignItems: 'start',
      margin: '0 auto',
      maxWidth: '66rem',
      minWidth: '36rem',
      overflow: 'hidden',
    },

    '& .form-builder-panel .btn': {
      textAlign: 'left',
    },
  },
};

export default formBuilderStyles;
