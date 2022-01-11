import { migrateForm } from "./migrationScripts";

const originalPanelComponent = {
  title: "Veiledning",
  breadcrumbClickable: true,
  buttonSettings: {
    previous: true,
    cancel: true,
    next: true,
  },
  navigateOnEnter: false,
  saveOnEnter: false,
  scrollToTop: false,
  collapsible: false,
  key: "veiledning",
  type: "panel",
  label: "Veiledning",
  input: false,
  components: [],
  tableView: false,
};

const originalSkjemaGruppeComponent = {
  legend: "Skjemagruppe",
  key: "navSkjemagruppe",
  type: "navSkjemagruppe",
  label: "Skjemagruppe",
  input: false,
  tableView: false,
  components: [],
};

const originalTextFieldComponent = {
  label: "Fornavn",
  fieldSize: "input--xxl",
  autocomplete: "given-name",
  validateOn: "blur",
  validate: {
    required: true,
  },
  key: "nyttFornavn",
  type: "textfield",
  input: true,
  dataGridLabel: true,
  tableView: true,
};

const originalFodselsnummerComponent = {
  label: "Fødselsnummer / D-nummer",
  key: "fodselsnummerDNummer",
  type: "fnrfield",
  fieldSize: "input--s",
  input: true,
  spellcheck: false,
  dataGridLabel: true,
  validateOn: "blur",
  validate: {
    custom: "valid = instance.originalValidateFnr(input)",
    required: true,
  },
  tableView: true,
};

const originalForm = {
  path: "test-form",
  components: [originalFodselsnummerComponent, originalTextFieldComponent],
};

const migrateFnrFieldFunction = (component) => ({
  ...component,
  validate: {
    ...component.validate,
    custom: "valid = instance.newValidateFnr(input)",
  },
});

describe("Migration scripts", () => {
  describe("migrateForm", () => {
    it("can update component based on type", () => {
      const actual = migrateForm(originalForm, { type: "fnrfield" }, migrateFnrFieldFunction);
      expect(actual).toEqual({
        path: "test-form",
        components: [
          {
            ...originalFodselsnummerComponent,
            validate: {
              custom: "valid = instance.newValidateFnr(input)",
              required: true,
            },
          },
          originalTextFieldComponent,
        ],
      });
    });

    it("can migrate subcomponents", () => {
      const actual = migrateForm(
        {
          path: "test-form",
          components: [
            {
              ...originalPanelComponent,
              components: [originalFodselsnummerComponent],
            },
          ],
        },
        { type: "fnrfield" },
        migrateFnrFieldFunction
      );

      expect(actual).toEqual({
        path: "test-form",
        components: [
          {
            ...originalPanelComponent,
            components: [
              {
                ...originalFodselsnummerComponent,
                validate: {
                  custom: "valid = instance.newValidateFnr(input)",
                  required: true,
                },
              },
            ],
          },
        ],
      });
    });

    it("can migrate subcomponents of a migrated component", () => {
      const actual = migrateForm(
        {
          path: "test-form",
          components: [
            {
              ...originalSkjemaGruppeComponent,
              components: [
                {
                  ...originalSkjemaGruppeComponent,
                  key: "subSkjemaGruppe",
                  components: [originalTextFieldComponent],
                },
              ],
            },
          ],
        },
        { type: "navSkjemagruppe" },
        (component) => ({
          ...component,
          modifiedByTest: true,
        })
      );

      expect(actual).toEqual({
        path: "test-form",
        components: [
          {
            ...originalSkjemaGruppeComponent,
            modifiedByTest: true,
            components: [
              {
                ...originalSkjemaGruppeComponent,
                key: "subSkjemaGruppe",
                modifiedByTest: true,
                components: [originalTextFieldComponent],
              },
            ],
          },
        ],
      });
    });
  });
});
