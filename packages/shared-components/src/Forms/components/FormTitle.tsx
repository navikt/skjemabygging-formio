import { NavFormType } from "@navikt/skjemadigitalisering-shared-domain";
import { Sidetittel } from "nav-frontend-typografi";
import React from "react";
import { useLanguages } from "../../context/languages";

export interface Props {
  form: NavFormType;
  className?: string;
}

export function FormTitle({ form, className }: Props) {
  const { translate } = useLanguages();

  return (
    <header className={className}>
      <Sidetittel>{translate(form.title)}</Sidetittel>
      {form.properties && form.properties.skjemanummer && <p>{form.properties.skjemanummer}</p>}
    </header>
  );
}
