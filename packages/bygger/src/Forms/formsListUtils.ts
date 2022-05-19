import { FormPropertiesType, NavFormType } from "@navikt/skjemadigitalisering-shared-domain";
import { determineStatus, Status } from "./FormStatusPanel";

export type SortDirection = "ascending" | "descending";
export type SimpleNavFormType = Pick<NavFormType, "_id" | "modified" | "title" | "path" | "tags" | "properties"> &
  Pick<FormPropertiesType, "skjemanummer" | "tema">;

export function sortByStatus(forms: SimpleNavFormType[], sortOrder?: SortDirection) {
  const statusOrder: Record<Status, number> = {
    UNKNOWN: 99,
    PUBLISHED: 1,
    DRAFT: 2,
    PENDING: 3,
  };
  const compareStatus = (thisStatus, thatStatus) => {
    if (thisStatus === thatStatus) return 0;
    if (thisStatus === "UNKNOWN") return 1;
    if (thatStatus === "UNKNOWN") return -1;
    if (sortOrder === "ascending") return statusOrder[thisStatus] - statusOrder[thatStatus];
    if (sortOrder === "descending") return statusOrder[thatStatus] - statusOrder[thisStatus];
    return 0;
  };
  return forms.sort((a, b) => compareStatus(determineStatus(a.properties), determineStatus(b.properties)));
}

export function simplifiedForms(forms: NavFormType[]): SimpleNavFormType[] {
  return forms.map((form) => ({
    _id: form._id,
    modified: form.modified,
    title: form.title.trim(),
    path: form.path,
    tags: form.tags,
    skjemanummer: form.properties ? (form.properties.skjemanummer ? form.properties.skjemanummer.trim() : "") : "",
    tema: form.properties ? (form.properties.tema ? form.properties.tema : "") : "",
    properties: form.properties,
  }));
}
