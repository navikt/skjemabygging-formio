const formComponentsListStyles = {
  '.formcomponents': {
    //overflowY: 'auto',
    //height: '100%',
    //width: '14rem',
    '& .builder-sidebar_scroll': {
      /*position: 'initial',
      paddingBottom: '10rem',*/
    },
    '& .card-body': {
      padding: '0.2rem',
    },
    '& .form-builder-panel': {
      //backgroundColor: '#ffffff',
      //borderRadius: 'calc(.25rem - 1px)',

      '& .form-builder-group-header': {
        margin: '0',
        padding: '0',
        '& h5': {
          margin: '0',
        },
      },

      '& .builder-group-button': {
        display: 'block',
        width: '100%',
        backgroundColor: 'rgba(0,0,0,.03)',
        border: '0',
        padding: '.375rem .75rem',
        fontSize: '1rem',
        lineHeight: '1.5',

        '&:not(:first-child)': {
          marginTop: '0.2rem',
        },
      },
      '&:first-child .builder-group-button': {
        borderRadius: 'calc(.25rem - 1px) calc(.25rem - 1px) 0 0',
      },
      '&:last-child .builder-group-button': {
        borderRadius: '0 0 calc(.25rem - 1px) calc(.25rem - 1px)',
      },
    },
  },
  '.formcomponent': {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
    borderRadius: '.3em',
    color: '#fff',
    display: 'block',
    fontSize: '.8em',
    lineHeight: '1.2',
    margin: '.2rem',
    padding: '5px 5px 5px 8px',
    textAlign: 'left',
    width: 'block',

    '&:hover': {
      backgroundColor: '#0069d9',
      borderColor: '#0062cc',
      cursor: 'pointer',
    },
  },
};

export default formComponentsListStyles;
