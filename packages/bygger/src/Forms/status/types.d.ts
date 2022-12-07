import { FormPropertiesType } from "@navikt/skjemadigitalisering-shared-domain";

export type Status = "PENDING" | "DRAFT" | "PUBLISHED" | "UNKNOWN" | "TESTFORM" | "UNPUBLISHED";

export type StreetLightSize = "small" | "large";

export type PublishStatusProperties = Pick<FormPropertiesType, "modified" | "published" | "isTestForm" | "unpublished">;

export type PublishProperties = PublishStatusProperties &
  Pick<FormPropertiesType, "modifiedBy" | "publishedBy" | "unpublishedBy" | "publishedLanguages">;
