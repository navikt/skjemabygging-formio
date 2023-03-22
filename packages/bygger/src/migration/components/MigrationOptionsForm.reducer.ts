import { guid } from "@navikt/skjemadigitalisering-shared-domain";
import { MigrationOption, MigrationOptions } from "../../../types/migration";

const createMigrationOption = (migrationOption: MigrationOption = { key: "", value: "" }): MigrationOptions => ({
  [guid()]: migrationOption,
});

export type Action =
  | { type: "add" }
  | {
      type: "edit";
      payload: { id: string } & Partial<MigrationOption>;
    };

export const reducer = (state: MigrationOptions = {}, action: Action) => {
  switch (action.type) {
    case "add":
      return {
        ...state,
        ...createMigrationOption(),
      };
    case "edit":
      const { id, ...rest } = action.payload;
      return {
        ...state,
        [id]: {
          ...state[id],
          ...rest,
        },
      };
    default:
      return state;
  }
};
