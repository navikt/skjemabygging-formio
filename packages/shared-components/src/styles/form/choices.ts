const choices = {
  '& .choices': {
    width: '100%',
    minHeight: 'var(--input-min-height)',

    '&__button': {
      padding: '0',
      backgroundColor: 'transparent',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: '50%',
      backgroundSize: '8px',
      border: '0',
      textIndent: '-9999px',
    },
    '&[data-type*=select-multiple], &[data-type*=text]': {
      '& .choices__button': {
        position: 'relative',
        display: 'inline-block',
        margin: '0 -4px 0 8px',
        paddingLeft: '16px',
        borderLeft: '1px solid #008fa1',
        backgroundImage:
          'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjEiIGhlaWdodD0iMjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMi41OTIuMDQ0bDE4LjM2NCAxOC4zNjQtMi41NDggMi41NDhMLjA0NCAyLjU5MnoiLz48cGF0aCBkPSJNMCAxOC4zNjRMMTguMzY0IDBsMi41NDggMi41NDhMMi41NDggMjAuOTEyeiIvPjwvZz48L3N2Zz4=)',
        backgroundSize: '8px',
        width: '8px',
        lineHeight: '1',
        opacity: '.75',
        borderRadius: '0',
      },
    },

    '&[data-type*=select-one]': {
      '& .choices__button': {
        backgroundImage:
          'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjEiIGhlaWdodD0iMjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMi41OTIuMDQ0bDE4LjM2NCAxOC4zNjQtMi41NDggMi41NDhMLjA0NCAyLjU5MnoiLz48cGF0aCBkPSJNMCAxOC4zNjRMMTguMzY0IDBsMi41NDggMi41NDhMMi41NDggMjAuOTEyeiIvPjwvZz48L3N2Zz4=)',
        padding: '0',
        backgroundSize: '8px',
        position: 'absolute',
        top: '50%',
        right: '0',
        marginTop: '-10px',
        marginRight: '25px',
        height: '20px',
        width: '20px',
        borderRadius: '10em',
        opacity: '.5',
      },
    },

    '&.form-group:not(.formio-hidden)': {
      marginBottom: '0',
    },

    '&__list': {
      margin: '0',
      paddingLeft: '0',
      listStyle: 'none',

      '&--multiple': {
        display: 'inline',
        float: 'left',

        '& .choices__item': {
          display: 'inline-block',
          width: 'fit-content',
          fontSize: '12px',
          fontWeight: '500',
          backgroundColor: '#00bcd4',
          border: '1px solid #00a5bb',
          color: '#fff',
          wordBreak: 'break-all',
          boxSizing: 'border-box',
          borderRadius: '0',
          padding: '0.25rem',
          lineHeight: '1em',
          marginBottom: '0.5rem',
          marginRight: '0.25rem',

          '&[data-deletable]': {
            position: 'relative',
          },
        },
      },

      '&--dropdown': {
        position: 'absolute',
        width: '100%',
        maxWidth: '420px',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        top: '100%',
        marginTop: '-1px',
        borderBottomLeftRadius: '2.5px',
        borderBottomRightRadius: '2.5px',
        overflow: 'hidden',
        wordBreak: 'break-all',
        willChange: 'visibility',
        display: 'none',
        zIndex: '100',

        '&.is-active': {
          position: 'relative',
          display: 'block',
        },

        '& .choices__list': {
          position: 'relative',
          maxHeight: '300px',
          overflow: 'auto',
          willChange: 'scroll-position',
        },

        '& .choices__item': {
          position: 'relative',
          padding: '10px',
          fontSize: '14px',

          '&--selectable': {
            whiteWrap: 'nowrap',
            overflow: 'hidden',
            paddingRight: '25px',
            textOverflow: 'ellipsis',

            '&.is-highlighted': {
              backgroundColor: '#f2f2f2',
            },
          },

          '&[data-deletable]': {},
        },

        '& .choices__input': {
          display: 'block',
          width: '100%',
          padding: '10px',
          borderBottom: '1px solid #ddd',
          backgroundColor: '#fff',
          margin: '0',
          verticalAlign: 'baseline',
          fontSize: 'var(--ax-font-size-large)',
          border: '0',
          borderRadius: '0',
          maxWidth: '100%',
        },
      },
    },
    '&__inner': {
      display: 'inline-block',
      verticalAlign: 'top',
      width: '100%',
      backgroundColor: '#f9f9f9',
      padding: '7.5px 7.5px 3.75px',
      border: '1px solid #ddd',
      borderRadius: '2.5px',
      fontSize: '14px',
      minHeight: '44px',
      overflow: 'hidden',
    },
    '&__input': {
      display: 'inline-block',
      verticalAlign: 'baseline',
      fontSize: '14px',
      marginBottom: '5px',
      border: '0',
      borderRadius: '0',
      maxWidth: '100%',
      padding: '4px 0 4px 2px',
      appearance: 'none',
      '&:focus': {
        outline: '0',
      },
    },
    '& .form-control.selection': {
      position: 'relative',
      width: '100%',
      maxWidth: '420px',
      overflow: 'hidden',
      backgroundColor: '#fff',
      '&:before': {
        pointerEvents: 'none',
        content: "''",
        background: '#262626',
        height: '2px',
        width: '10px',
        borderRadius: '10px',
        right: '0.75rem',
        top: '50%',
        zIndex: 4,
        position: 'absolute',
        transform: 'translateX(3px) rotate(-45deg)',
      },
      '&:after': {
        pointerEvents: 'none',
        content: "''",
        background: '#262626',
        height: '2px',
        width: '10px',
        borderRadius: '10px',
        right: '0.75rem',
        top: '50%',
        zIndex: 4,
        position: 'absolute',
        transform: 'translateX(-3px) rotate(45deg)',
      },
    },
  },
  '& .has-feedback .form-control.selection': {
    height: 'calc(1.5em + .75rem + 2px)',
    minHeight: 'var(--input-min-height)',
    padding: '0.5rem',
    fontSize: 'var(--ax-font-size-large)',
    fontWeight: '400',
    lineHeight: '1.5',
    border: '1px solid #78706a',
    borderRadius: '.25rem',
  },
  '& .formio-select-autocomplete-input': {
    opacity: 0,
    zIndex: -1,
    position: 'absolute',
  },
  '& .choices.form-group.formio-choices': {
    '&:after': {
      display: 'none',
    },
  },
};

export default choices;
