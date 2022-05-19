import { FormPropertiesType, NavFormType } from "@navikt/skjemadigitalisering-shared-domain";
import { determineStatus, Status } from "./FormStatusPanel";

export type SortDirection = "ascending" | "descending";
export type SimpleNavFormType = Pick<NavFormType, "_id" | "modified" | "title" | "path" | "tags" | "properties"> &
  Pick<FormPropertiesType, "skjemanummer" | "tema">;

export function sortFormsByProperty(
  forms: SimpleNavFormType[],
  sortingKey: keyof SimpleNavFormType,
  sortingOrder?: SortDirection
) {
  return forms.sort((a, b) => {
    const valueA = a[sortingKey] || "";
    const valueB = b[sortingKey] || "";
    if (sortingOrder === "ascending") {
      return valueA < valueB ? -1 : 1;
    } else if (sortingOrder === "descending") {
      return valueA < valueB ? 1 : -1;
    }
    return 0;
  });
}

export function sortByFormNumber(forms: SimpleNavFormType[], sortDirection?: SortDirection) {
  const matchesNavSkjemanummer = (formMetaData: SimpleNavFormType) => {
    return formMetaData.skjemanummer.match(/^(NAV)\s\d\d-\d\d.\d\d/);
  };

  if (sortDirection === "ascending") {
    return [
      ...sortFormsByProperty(forms.filter(matchesNavSkjemanummer), "skjemanummer", "ascending"),
      ...sortFormsByProperty(
        forms.filter((data) => !matchesNavSkjemanummer(data)),
        "skjemanummer",
        "descending"
      ),
    ];
  }
  if (sortDirection === "descending") {
    return [
      ...sortFormsByProperty(
        forms.filter((data) => !matchesNavSkjemanummer(data)),
        "skjemanummer",
        "ascending"
      ),
      ...sortFormsByProperty(forms.filter(matchesNavSkjemanummer), "skjemanummer", "descending"),
    ];
  }
  return forms;
}

export function sortByStatus(forms: SimpleNavFormType[], sortOrder?: SortDirection) {
  const statusOrder: Record<Status, number> = {
    UNKNOWN: 99,
    PUBLISHED: 1,
    PENDING: 2,
    DRAFT: 3,
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
