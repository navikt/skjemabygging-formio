import { Button } from "@navikt/ds-react";
import { useState } from "react";

const PrimaryButtonWithSpinner = ({ children, onClick }) => {
  const [isSaving, setIsSaving] = useState(false);
  async function onClickWithSpinner() {
    setIsSaving(true);
    await onClick();
    setIsSaving(false);
  }
  return (
    <Button onClick={onClickWithSpinner} loading={isSaving}>
      {children}
    </Button>
  );
};

export default PrimaryButtonWithSpinner;
