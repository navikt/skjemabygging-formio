import { Collapse, Expand } from '@navikt/ds-icons';
import { Link } from '@navikt/ds-react';
import { useRef, useState } from 'react';
import { Link as ReactRouterLink } from 'react-router';
import makeStyles from '../../../util/styles/jss/jss';

const useSelectStyle = makeStyles({
  overlay: {
    position: 'fixed',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
  },
  nav: {
    position: 'relative',

    '& .navds-select__input': {
      textAlign: 'start',
    },
  },
});

const handleTabKeyPressed = (event, firstItem, lastItem, index, numberOfItemsInList) => {
  if (event.key !== 'Tab') {
    return;
  }
  if (event.shiftKey && index === 0) {
    event.preventDefault();
    lastItem.current.focus();
  } else if (!event.shiftKey && index === numberOfItemsInList - 1) {
    event.preventDefault();
    firstItem.current.focus();
  }
};

const Select = ({ label, className, options, ariaLabel }) => {
  const buttonRef = useRef(null);
  const firstListItemLinkRef = useRef(null);
  const lastListItemLinkRef = useRef(null);
  const [showItems, setShowItems] = useState(false);
  const classes = useSelectStyle();

  const closeListAndResetFocus = () => {
    setShowItems(false);
    buttonRef.current.focus();
  };

  const closeOnEscape = (event) => {
    if (event.key === 'Escape') {
      closeListAndResetFocus();
    }
  };

  return (
    <>
      {showItems && <div className={classes.overlay} onClick={closeListAndResetFocus} />}
      <nav className={`${className} ${classes.nav}`} onKeyUp={closeOnEscape} aria-label={ariaLabel}>
        <button
          className="navds-select__input navds-body-short navds-body--medium"
          aria-expanded={showItems}
          onClick={() => setShowItems(!showItems)}
          type="button"
          ref={buttonRef}
        >
          {label}
          {showItems ? (
            <Collapse className="navds-select__chevron" aria-hidden />
          ) : (
            <Expand className="navds-select__chevron" aria-hidden />
          )}
        </button>
        {showItems && (
          <ul className="select-list">
            {options.map(({ href, optionLabel, onClick = () => {} }, index) => (
              <li
                className="select-list__option"
                key={optionLabel}
                onKeyDown={(event) =>
                  handleTabKeyPressed(event, firstListItemLinkRef, lastListItemLinkRef, index, options.length)
                }
              >
                <Link
                  as={ReactRouterLink}
                  className="select-list__option__link"
                  to={href}
                  onClick={() => {
                    onClick();
                    closeListAndResetFocus();
                  }}
                  ref={
                    index === 0 ? firstListItemLinkRef : index === options.length - 1 ? lastListItemLinkRef : undefined
                  }
                >
                  {optionLabel}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </>
  );
};

export default Select;
