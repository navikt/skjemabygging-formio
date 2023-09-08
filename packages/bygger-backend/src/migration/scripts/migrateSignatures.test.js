import migrateSignatures from "./migrateSignatures";

const createMockForm = (signatures, hasLabeledSignatures) => ({
  components: [],
  display: "wizard",
  name: "mockForm",
  path: "mockForm",
  properties: {
    skjemanummer: "test-001",
    tema: "xxx",
    signatures,
    hasLabeledSignatures,
  },
  tags: [],
  type: "form",
  title: "Mock Form",
});

describe("Migration of signatures", () => {
  let migrationScript;

  beforeAll(() => {
    migrationScript = migrateSignatures({}, []);
  });
  describe("for (legacy-)forms without a signatures object", () => {
    it("adds an array of signatures with a default object with empty strings for label and description", () => {
      const actual = migrationScript(createMockForm());
      expect(actual.properties.signatures).toEqual([
        {
          label: "",
          description: "",
        },
      ]);
    });
  });

  describe("for forms with existing custom signatures", () => {
    it("changes the old signatures object to an array with one object for each signature in use", () => {
      const mockForm = createMockForm(
        {
          signature1: "Signature 1",
          signature2: "Signature 2",
          signature3: "Signature 3",
          signature4: "Signature 4",
          signature5: "Signature 5",
        },
        true
      );
      const actual = migrationScript(mockForm);
      expect(actual.properties.signatures).toEqual([
        { label: "Signature 1" },
        { label: "Signature 2" },
        { label: "Signature 3" },
        { label: "Signature 4" },
        { label: "Signature 5" },
      ]);
    });

    it("includes both label and description where both exist", () => {
      const mockForm = createMockForm(
        {
          signature1: "Signature 1",
          signature1Description: "Signature 1 description",
          signature2: "Signature 2",
          signature2Description: "Signature 2 description",
        },
        true
      );
      const actual = migrationScript(mockForm);
      expect(actual.properties.signatures).toEqual([
        {
          label: "Signature 1",
          description: "Signature 1 description",
        },
        {
          label: "Signature 2",
          description: "Signature 2 description",
        },
      ]);
    });

    it("only adds a default object with empty strings for label and description where no signatures are used", () => {
      const mockForm = createMockForm(
        { signature1: "", signature2: "", signature3: "", signature4: "", signature5: "" },
        true
      );
      const actual = migrationScript(mockForm);
      expect(actual.properties.signatures).toEqual([{ label: "", description: "" }]);
    });

    it("removes the now unused hasLabeledSignatures boolean", () => {
      const mockForm = createMockForm({ signature1: "" }, true);
      const actual = migrationScript(mockForm);
      expect(actual.properties).not.toHaveProperty("hasLabeledSignatures");
    });
  });
});
