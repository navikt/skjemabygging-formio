import clsx from 'clsx';
import makeStyles from '../../util/styles/jss/jss';
import { navCssVariables } from '../../util/styles/nav-css/navCssVariables';
import Select from './select/Select';

const useLanguageSelectorStyling = makeStyles({
  languageToggleWrapper: {
    outline: 'none',
    position: 'relative',
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '1rem',
  },
  languageSelect: {
    position: 'relative',
    width: '200px',
    '& .select-button': {
      width: '100%',
      display: 'grid',
      border: '1px solid #826ba1',
      borderRadius: '0.25rem',
      alignItems: 'center',
      gridTemplateColumns: 'auto 1rem',
      padding: '0.5rem 2rem 0.5rem 1rem',
      '&:focus': {
        outline: 'none',
        boxShadow: '0 0 0 3px #254b6d',
        borderColor: 'transparent',
      },
      '& .select__chevron': {
        float: 'right',
      },
    },
    '& .select-list': {
      margin: '0',
      padding: '0',
      width: '100%',
      backgroundColor: 'white',
      boxSizing: 'border-box',
      borderRight: '1px solid rgb(198, 194, 191)',
      borderBottom: '1px solid rgb(198, 194, 191)',
      borderLeft: '1px solid rgb(198, 194, 191)',
      borderImage: 'initial',
      borderTop: 'none',
      boxShadow: 'rgba(0, 0, 0, 0.08) 0px 0.05rem 0.25rem 0.125rem',
      borderRadius: '0px 0px 4px 4px',
      outline: 'none',
      cursor: 'pointer',
      listStyleType: 'none',
      position: 'absolute',
      top: '2.8125rem',
      left: 0,
      zIndex: 1000,
    },
    '& .select-list__option': {
      borderBottom: '1px solid rgb(198, 194, 191)',
    },
    '& .select-list__option__link': {
      display: 'block',
      padding: '0.5rem 1rem',
      '&:hover, &:focus': {
        backgroundColor: navCssVariables.navBla,
        color: 'white',
        width: '100%',
        height: '100%',
      },
    },
  },
});

const LanguageSelector = ({ label, ariaLabel = 'Velg språk', options, className }) => {
  const classes = useLanguageSelectorStyling();
  return (
    <div
      className={clsx(classes.languageToggleWrapper, {
        [className]: className,
      })}
    >
      <Select className={classes.languageSelect} label={label} options={options} ariaLabel={ariaLabel} />
    </div>
  );
};

export default LanguageSelector;
