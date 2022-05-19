import { Hovedknapp } from "nav-frontend-knapper";
import React, { useState } from "react";

const PrimaryButtonWithSpinner = ({ children, onClick }) => {
  const [isSaving, setIsSaving] = useState(false);
  async function onClickWithSpinner() {
    setIsSaving(true);
    await onClick();
    setIsSaving(false);
  }
  return (
    <Hovedknapp onClick={onClickWithSpinner} spinner={isSaving}>
      {children}
    </Hovedknapp>
  );
};

export default PrimaryButtonWithSpinner;
