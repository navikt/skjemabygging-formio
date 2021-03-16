import React, { useRef, useState } from "react";
import { Collapse, Expand } from "@navikt/ds-icons";

const closeOnEscape = (event, close, buttonRef) => {
  if (event.key === "Escape") {
    close();
    buttonRef.current.focus();
  }
};

const Select = ({ label, className, onChange, options }) => {
  const buttonRef = useRef(null);
  const [showItems, setShowItems] = useState(false);
  return (
    <nav className={className} onKeyUp={(event) => closeOnEscape(event, () => setShowItems(false), buttonRef)}>
      <button className="select-button" onClick={() => setShowItems(!showItems)} ref={buttonRef}>
        {label}
        {showItems ? <Collapse className="select__chevron" /> : <Expand className="select__chevron" />}
      </button>
      {showItems && (
        <ul className="select-list">
          {options.map(({ href, onClick, optionLabel }) => (
            <li className="select-list__option">
              <a
                className="select-list__option__link"
                href={href}
                onClick={(event) => {
                  event.preventDefault();
                  onClick();
                }}
              >
                {optionLabel}
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
};

export default Select;
