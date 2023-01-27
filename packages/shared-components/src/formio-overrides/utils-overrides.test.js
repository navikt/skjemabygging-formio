import { formDiffingTool, navFormUtils } from "@navikt/skjemadigitalisering-shared-domain";
import panelDiffDeletedDatagrid from "./testdata/diff-deleted-datagrid";
import panelDiffDeletedRadiopanel from "./testdata/diff-deleted-radio";
import formNavSelectChanges from "./testdata/form-navSelect-changes";
import publishedForm from "./testdata/published-form";
import { getDiffTag, navFormDiffToHtml, sanitizeJavaScriptCode } from "./utils-overrides";

describe("utils-overrides", () => {
  describe("sanitizeJavaScriptCode", () => {
    it("does not change a string without chained lookups", () => {
      const aSentence = "this is a string.";
      expect(sanitizeJavaScriptCode(aSentence)).toEqual(aSentence);

      const aRealisticInputWithoutChainedLookups = "show = a === 'b'";
      expect(sanitizeJavaScriptCode(aRealisticInputWithoutChainedLookups)).toEqual(
        aRealisticInputWithoutChainedLookups
      );
    });

    it("correctly adds null/undefined checks for chained lookups", () => {
      const inputWithChainedLookups = "show = a.b === 'c'";
      expect(sanitizeJavaScriptCode(inputWithChainedLookups)).toEqual("show = (a && a.b) === 'c'");
    });

    it("correctly adds null/undefined checks for multiple chained lookups", () => {
      const inputWithMultipleChainedLookups = "show = a.b === 'c' || d.e === 'f'";
      expect(sanitizeJavaScriptCode(inputWithMultipleChainedLookups)).toEqual(
        "show = (a && a.b) === 'c' || (d && d.e) === 'f'"
      );
    });

    it("correctly adds null/undefined checks for deeply chained lookups", () => {
      const inputWithDeeplyChainedLookups = "show = a.b.c.d.e === 'f'";
      expect(sanitizeJavaScriptCode(inputWithDeeplyChainedLookups)).toEqual(
        "show = (a && a.b && a.b.c && a.b.c.d && a.b.c.d.e) === 'f'"
      );
    });

    it("correctly add null/undefined checks for multiple equal chained lookups", () => {
      const inputWithMultipleEqualChainedLookups = "show = a.b === 'c' || a.b === 'd'";
      expect(sanitizeJavaScriptCode(inputWithMultipleEqualChainedLookups)).toEqual(
        "show = (a && a.b) === 'c' || (a && a.b) === 'd'"
      );
    });

    it("correctly add null/undefined checks when variable names includes numbers", () => {
      const inputWithMultipleEqualChainedLookups = "show = a1.b2 === 'c'";
      expect(sanitizeJavaScriptCode(inputWithMultipleEqualChainedLookups)).toEqual("show = (a1 && a1.b2) === 'c'");
    });

    it("will not change a partial expression", () => {
      const inputWithTwoChainedWhereOneIsAPartialOfTheOther =
        "show = anObject.aString === 'c' || anObject.aString1 === 'd'";
      const actual = sanitizeJavaScriptCode(inputWithTwoChainedWhereOneIsAPartialOfTheOther);
      expect(actual).toEqual(
        "show = (anObject && anObject.aString) === 'c' || (anObject && anObject.aString1) === 'd'"
      );
    });

    it("will not change a partial expression that ends in an equal expression to another complete expression", () => {
      const inputWithOneChainedExpressionEndingInAnotherExpression =
        "show = anObject.aString === 'c' || Object.aString === 'd'";
      const actual = sanitizeJavaScriptCode(inputWithOneChainedExpressionEndingInAnotherExpression);
      expect(actual).toEqual("show = (anObject && anObject.aString) === 'c' || (Object && Object.aString) === 'd'");
    });

    describe("When the code includes function calls", () => {
      it("does not add null checks for functions on instance", () => {
        const inputWithInstanceFunctionCall = "valid = instance.validate(input)";
        expect(sanitizeJavaScriptCode(inputWithInstanceFunctionCall)).toEqual("valid = instance.validate(input)");
      });

      it("does not add null checks for functions on util", () => {
        const inputWithUtilFunctionCall = "valid = util.fun(input)";
        expect(sanitizeJavaScriptCode(inputWithUtilFunctionCall)).toEqual("valid = util.fun(input)");
      });

      it("does not add null checks for functions on utils", () => {
        const inputWithUtilsFunctionCall = "valid = utils.fun(input)";
        expect(sanitizeJavaScriptCode(inputWithUtilsFunctionCall)).toEqual("valid = utils.fun(input)");
      });

      it("does not add null checks for functions on lodash", () => {
        const inputWithLodashFunctionCall = "valid = _.fun(input)";
        expect(sanitizeJavaScriptCode(inputWithLodashFunctionCall)).toEqual("valid = _.fun(input)");
      });

      it("does not add null checks for nested functions on a reserved word", () => {
        const inputWithNestedFunctionCalls = "valid = instance.fun1(_.some(data, (a) => util.fun2(a.b.c)))";
        expect(sanitizeJavaScriptCode(inputWithNestedFunctionCalls)).toEqual(
          "valid = instance.fun1(_.some(data, (a) => util.fun2((a && a.b && a.b.c))))"
        );
      });

      it("does not add null checks for function calls", () => {
        const inputWithFunctionCall = "valid = obj.myFunction()";
        expect(sanitizeJavaScriptCode(inputWithFunctionCall)).toEqual("valid = obj.myFunction()");

        const inputWithFunctionThatTakesParams = "valid = obj.myFunction(someInput)";
        expect(sanitizeJavaScriptCode(inputWithFunctionThatTakesParams)).toEqual("valid = obj.myFunction(someInput)");

        const inputWithNestedFunctionCall = "valid = parentObject.childObject.nestedFunction()";
        expect(sanitizeJavaScriptCode(inputWithNestedFunctionCall)).toEqual(
          "valid = parentObject.childObject.nestedFunction()"
        );

        const inputWithNestedObjectReferenceAndFunctionCall = "valid = obj.someVar || obj.someFunction()";
        expect(sanitizeJavaScriptCode(inputWithNestedObjectReferenceAndFunctionCall)).toEqual(
          "valid = (obj && obj.someVar) || obj.someFunction()"
        );
      });
    });
  });

  describe("navFormDiffToHtml", () => {
    it("generates html list with changed properties", () => {
      const changes = {
        status: "Endring",
        diff: {
          label: { status: "Endring", originalValue: "Fornavn", value: "Oppgi fornavn" },
          id: { status: "Endring", originalValue: "ehnemzu", value: "e6s77h" },
        },
        key: "fornavn",
        type: "textfield",
      };
      const diffSummary = formDiffingTool.createDiffSummary(changes);
      const html = navFormDiffToHtml(diffSummary);
      expect(html).toMatchSnapshot();
    });

    it("generates html list with deleted radiopanel from panel", () => {
      const diffSummary = formDiffingTool.createDiffSummary(panelDiffDeletedRadiopanel);
      const html = navFormDiffToHtml(diffSummary);
      expect(html).toMatchSnapshot();
    });

    it("generates nested html list with deleted datagrid and its components", () => {
      const diffSummary = formDiffingTool.createDiffSummary(panelDiffDeletedDatagrid);
      const html = navFormDiffToHtml(diffSummary);
      expect(html).toMatchSnapshot();
    });

    it("handles failure when diffSummary is of unexpected type", () => {
      const originalConsoleError = console.error;
      console.error = () => {};
      try {
        const diffSummary = { some: "thing", is: "wrong", with: ["this", "obj", "ect"] };
        const html = navFormDiffToHtml(diffSummary);
        expect(html).toMatchSnapshot();
      } catch (e) {
        throw new Error(`Should never fail, but it did: ${e.message}`);
      } finally {
        console.error = originalConsoleError;
      }
    });

    describe("Form -> diff -> html", () => {
      it("empty html when navSelect is not changed", () => {
        const navSelect = navFormUtils.findByNavId("e0a8kbj", publishedForm.components);
        const componentDiff = formDiffingTool.getComponentDiff(navSelect, publishedForm);
        const html = navFormDiffToHtml(componentDiff);
        expect(html).toEqual("");
        expect(html).toMatchSnapshot();
      });
      it("should list changes for navSelect", () => {
        const navSelect = navFormUtils.findByNavId("e0a8kbj", formNavSelectChanges.components);
        const componentDiff = formDiffingTool.getComponentDiff(navSelect, publishedForm);
        const html = navFormDiffToHtml(componentDiff);
        expect(html).toMatchSnapshot();
      });
      it("should list changed key", () => {
        const radiopanel = navFormUtils.findByKey("doYouLiveInNorway", formNavSelectChanges.components);
        const componentDiff = formDiffingTool.getComponentDiff(radiopanel, publishedForm);
        const html = navFormDiffToHtml(componentDiff);
        expect(html).toMatchSnapshot();
      });
      it("should list change in conditional", () => {
        const alertstripe = navFormUtils.findByKey("alertstripeArstid", formNavSelectChanges.components);
        const componentDiff = formDiffingTool.getComponentDiff(alertstripe, publishedForm);
        const html = navFormDiffToHtml(componentDiff);
        expect(html).toMatchSnapshot();
      });
    });
  });

  describe("getDiffTag", () => {
    it("returns no tag when component is unchanged", () => {
      const navSelect = navFormUtils.findByNavId("e0a8kbj", publishedForm.components);
      const ctx = {
        builder: true,
        component: navSelect,
        config: {
          publishedForm,
        },
      };
      const html = getDiffTag(ctx);
      expect(html).toMatchSnapshot();
    });

    it("returns tag 'Endring' when component is changed", () => {
      const navSelect = navFormUtils.findByNavId("e0a8kbj", formNavSelectChanges.components);
      const ctx = {
        builder: true,
        component: navSelect,
        config: {
          publishedForm,
        },
      };
      const html = getDiffTag(ctx);
      expect(html).toMatchSnapshot();
    });

    it("returns no tag even if component is changed when it renders outside builder", () => {
      const navSelect = navFormUtils.findByNavId("e0a8kbj", formNavSelectChanges.components);
      const ctx = {
        builder: false,
        component: navSelect,
        config: {
          publishedForm,
        },
      };
      const html = getDiffTag(ctx);
      expect(html).toMatchSnapshot();
    });

    it("returns tag 'Ny' when component does not exist in published form", () => {
      const component = { navId: "123456", key: "aaaa" };
      const ctx = {
        builder: true,
        component,
        config: {
          publishedForm,
        },
      };
      const html = getDiffTag(ctx);
      expect(html).toMatchSnapshot();
    });
  });
});
