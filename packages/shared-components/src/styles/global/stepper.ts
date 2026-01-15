const stepper = {
  '.stepper': {
    display: 'none',

    '@media screen and (min-width: 40rem)': {
      display: 'block',
      position: 'sticky',
      right: 0,
      top: 0,
    },

    '& .aksel-stepper__content': {
      maxWidth: '26ch',
      wordBreak: 'break-word',
      hyphens: 'auto',
    },
  },
  '.stepper--open': {
    display: 'block',
    position: 'fixed',
    right: 0,
    top: 0,
    zIndex: '100',
    width: 'calc(100vw - 1rem)',
    maxWidth: '20rem',
    height: '100%',
    backgroundColor: 'white',
    paddingTop: '4rem',

    '& .stepper-container': {
      position: 'relative',
      padding: '4rem 1.5rem 1.5rem',
      height: '100%',
      overflowY: 'auto',
    },
  },
  '.stepper-close': {
    position: 'absolute',
    right: '1rem',
    top: '1rem',
    width: 'initial',
    minWidth: 'initial',

    '@media screen and (min-width: 40rem)': {
      display: 'none',
    },
  },
  '.stepper-toggle': {
    paddingLeft: '1rem',
    paddingRight: '1rem',
    position: 'fixed',
    right: '-2px',
    top: '9rem',
    width: 'initial',
    minWidth: 'initial',
    backgroundColor: 'var(--ax-bg-default)',

    '@media screen and (min-width: 40rem)': {
      display: 'none',
    },

    '& svg': {
      height: '1.2rem',
      width: '1.2rem',
    },
  },

  '.stepper-backdrop': {
    display: 'none',
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
};

export default stepper;
