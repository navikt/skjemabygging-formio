import { FormPropertiesType, NavFormType } from "@navikt/skjemadigitalisering-shared-domain";
import { determineStatus, Status } from "./FormStatusPanel";

export type SortDirection = "ascending" | "descending";
export type FormMetadata = Pick<NavFormType, "_id" | "title" | "path" | "tags"> &
  Pick<FormPropertiesType, "skjemanummer" | "modified" | "published" | "tema"> & { status: Status };

export function sortFormsByProperty(
  formMetadataList: FormMetadata[],
  sortingKey: keyof FormMetadata,
  sortingOrder?: SortDirection
) {
  return formMetadataList.sort((a, b) => {
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

export function sortByFormNumber(formMetaDataList: FormMetadata[], sortDirection?: SortDirection) {
  const matchesNavSkjemanummer = (formMetaData: FormMetadata) => {
    return formMetaData.skjemanummer.match(/^(NAV)\s\d\d-\d\d.\d\d/);
  };

  if (sortDirection === "ascending") {
    return [
      ...sortFormsByProperty(formMetaDataList.filter(matchesNavSkjemanummer), "skjemanummer", "ascending"),
      ...sortFormsByProperty(
        formMetaDataList.filter((data) => !matchesNavSkjemanummer(data)),
        "skjemanummer",
        "descending"
      ),
    ];
  }
  if (sortDirection === "descending") {
    return [
      ...sortFormsByProperty(
        formMetaDataList.filter((data) => !matchesNavSkjemanummer(data)),
        "skjemanummer",
        "ascending"
      ),
      ...sortFormsByProperty(formMetaDataList.filter(matchesNavSkjemanummer), "skjemanummer", "descending"),
    ];
  }
  return formMetaDataList;
}

export function sortByStatus(formMetadataList: FormMetadata[], sortOrder?: SortDirection) {
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
  return formMetadataList.sort((a, b) => compareStatus(a.status, b.status));
}

export function asFormMetadata(form: NavFormType): FormMetadata {
  return {
    _id: form._id,
    modified: form.properties.modified || form.modified,
    published: form.properties.published,
    title: form.title.trim(),
    path: form.path,
    tags: form.tags,
    skjemanummer: form.properties ? (form.properties.skjemanummer ? form.properties.skjemanummer.trim() : "") : "",
    tema: form.properties ? (form.properties.tema ? form.properties.tema : "") : "",
    status: determineStatus(form.properties),
  };
}
