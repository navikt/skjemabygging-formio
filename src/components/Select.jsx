import React, { useState } from "react";

const Select = ({ label, className, onChange, options }) => {
  const [showItems, setShowItems] = useState(false);
  return (
    <nav className={className}>
      <button className="select-button" onClick={() => setShowItems(!showItems)}>
        {label}
      </button>
      {showItems && (
        <ul className="select-list">
          {options.map(({ optionLabel, value }) => (
            <li className="select-list__option">
              <a
                className="select-list__option__link"
                href={`?lang=${value}`}
                onClick={(event) => {
                  event.preventDefault();
                  onChange(value);
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
