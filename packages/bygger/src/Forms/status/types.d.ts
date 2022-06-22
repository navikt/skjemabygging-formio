import { FormPropertiesType } from "@navikt/skjemadigitalisering-shared-domain";

export type Status = "PENDING" | "DRAFT" | "PUBLISHED" | "UNKNOWN" | "TESTFORM";

export type StreetLightSize = "small" | "large";

export interface Props {
  formProperties: FormPropertiesType;
}
