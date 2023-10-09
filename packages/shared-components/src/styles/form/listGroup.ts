const listGroup = {
  '& .list-group': {
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: '0',
    marginBottom: '1rem',

    '&-item': {
      position: 'relative',
      display: 'block',
      padding: '.75rem 1.25rem',
      backgroundColor: '#fff',
      border: '1px solid rgba(0,0,0,.125)',

      '&:first-child': {
        borderTopLeftRadius: '.25rem',
        borderTopRightRadius: '.25rem',
      },
      '&:last-child': {
        borderBottomLeftRadius: '.25rem',
        borderBottomRightRadius: '.25rem',
      },
    },
  },
};

export default listGroup;
