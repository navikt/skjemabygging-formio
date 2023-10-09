const table = {
  '& .table': {
    borderCollapse: 'collapse',
    color: '#212529',
    width: '100%',

    '&-bordered': {
      border: '1px solid #dee2e6',

      '& th, & td': {
        border: '1px solid #dee2e6',
      },
    },

    '& thead': {
      '& th': {
        borderBottom: '2px solid #dee2e6',
        verticalAlign: 'bottom',
      },
      '& td, th': {
        borderBottomWidth: '2px',
      },
    },
    '& th, td': {
      padding: '.75rem',
      verticalAlign: 'top',
      borderTop: '1px solid #dee2e6',
    },

    '& .form-group.formio-component': {
      marginBottom: '0',
    },
  },
};

export default table;
