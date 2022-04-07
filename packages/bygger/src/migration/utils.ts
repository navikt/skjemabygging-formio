import { MigrationOptions } from "../../types/migration";
import { migrationOptionsAsMap } from "./MigrationPage";

export const createUrlParams = (searchFilters: MigrationOptions, editOptions: MigrationOptions) => {
  let searchFilterParameters = "";
  let editOptionsParameters = "";
  const encodedSearchFilters = JSON.stringify(migrationOptionsAsMap(searchFilters));
  if (encodedSearchFilters) {
    searchFilterParameters = `?searchFilters=${encodedSearchFilters}`;
    const encodedEditOption = JSON.stringify(migrationOptionsAsMap(editOptions));
    if (encodedEditOption) {
      editOptionsParameters = `&editOptions=${encodedEditOption}`;
    }
  }
  return `${searchFilterParameters}${editOptionsParameters}`;
};
