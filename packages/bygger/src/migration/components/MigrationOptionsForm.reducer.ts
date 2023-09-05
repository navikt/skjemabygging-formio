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
    }
  | {
      type: "remove";
      payload: { id: string };
    };

export const reducer = (state: MigrationOptions = {}, action: Action) => {
  switch (action.type) {
    case "add":
      return {
        ...state,
        ...createMigrationOption(),
      };
    case "edit": {
      const { id, ...rest } = action.payload;
      return {
        ...state,
        [id]: {
          ...state[id],
          ...rest,
        },
      };
    }
    case "remove": {
      const { id } = action.payload;
      const copyOfState = { ...state };
      delete copyOfState[id];
      return copyOfState;
    }
    default:
      return state;
  }
};
