import { formDiffingTool, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import moment from 'moment/moment';
import panelDiffDeletedDatagrid from '../../../../test/test-data/diff/diff-deleted-datagrid';
import panelDiffDeletedRadiopanel from '../../../../test/test-data/diff/diff-deleted-radio';
import formNavSelectChanges from '../../../../test/test-data/form/form-navSelect-changes';
import publishedForm from '../../../../test/test-data/form/published-form';
import UtilsOverrides from './utils-overrides';

describe('utils-overrides', () => {
  describe('sanitizeJavaScriptCode', () => {
    it('does not change a string without chained lookups', () => {
      const aSentence = 'this is a string.';
      expect(UtilsOverrides.sanitizeJavaScriptCode(aSentence)).toEqual(aSentence);

      const aRealisticInputWithoutChainedLookups = "show = a === 'b'";
      expect(UtilsOverrides.sanitizeJavaScriptCode(aRealisticInputWithoutChainedLookups)).toEqual(
        aRealisticInputWithoutChainedLookups,
      );
    });

    it('correctly adds null/undefined checks for chained lookups', () => {
      const inputWithChainedLookups = "show = a.b === 'c'";
      expect(UtilsOverrides.sanitizeJavaScriptCode(inputWithChainedLookups)).toBe("show = (a && a.b) === 'c'");
    });

    it('correctly adds null/undefined checks for multiple chained lookups', () => {
      const inputWithMultipleChainedLookups = "show = a.b === 'c' || d.e === 'f'";
      expect(UtilsOverrides.sanitizeJavaScriptCode(inputWithMultipleChainedLookups)).toBe(
        "show = (a && a.b) === 'c' || (d && d.e) === 'f'",
      );
    });

    it('correctly adds null/undefined checks for deeply chained lookups', () => {
      const inputWithDeeplyChainedLookups = "show = a.b.c.d.e === 'f'";
      expect(UtilsOverrides.sanitizeJavaScriptCode(inputWithDeeplyChainedLookups)).toBe(
        "show = (a && a.b && a.b.c && a.b.c.d && a.b.c.d.e) === 'f'",
      );
    });

    it('correctly add null/undefined checks for multiple equal chained lookups', () => {
      const inputWithMultipleEqualChainedLookups = "show = a.b === 'c' || a.b === 'd'";
      expect(UtilsOverrides.sanitizeJavaScriptCode(inputWithMultipleEqualChainedLookups)).toBe(
        "show = (a && a.b) === 'c' || (a && a.b) === 'd'",
      );
    });

    it('correctly add null/undefined checks when variable names includes numbers', () => {
      const inputWithMultipleEqualChainedLookups = "show = a1.b2 === 'c'";
      expect(UtilsOverrides.sanitizeJavaScriptCode(inputWithMultipleEqualChainedLookups)).toBe(
        "show = (a1 && a1.b2) === 'c'",
      );
    });

    it('will not change a partial expression', () => {
      const inputWithTwoChainedWhereOneIsAPartialOfTheOther =
        "show = anObject.aString === 'c' || anObject.aString1 === 'd'";
      const actual = UtilsOverrides.sanitizeJavaScriptCode(inputWithTwoChainedWhereOneIsAPartialOfTheOther);
      expect(actual).toBe("show = (anObject && anObject.aString) === 'c' || (anObject && anObject.aString1) === 'd'");
    });

    it('will not change a partial expression that ends in an equal expression to another complete expression', () => {
      const inputWithOneChainedExpressionEndingInAnotherExpression =
        "show = anObject.aString === 'c' || Object.aString === 'd'";
      const actual = UtilsOverrides.sanitizeJavaScriptCode(inputWithOneChainedExpressionEndingInAnotherExpression);
      expect(actual).toBe("show = (anObject && anObject.aString) === 'c' || (Object && Object.aString) === 'd'");
    });

    describe('When the code includes function calls', () => {
      it('does not add null checks for functions on instance', () => {
        const inputWithInstanceFunctionCall = 'valid = instance.validate(input)';
        expect(UtilsOverrides.sanitizeJavaScriptCode(inputWithInstanceFunctionCall)).toBe(
          'valid = instance.validate(input)',
        );
      });

      it('does not add null checks for functions on util', () => {
        const inputWithUtilFunctionCall = 'valid = util.fun(input)';
        expect(UtilsOverrides.sanitizeJavaScriptCode(inputWithUtilFunctionCall)).toBe('valid = util.fun(input)');
      });

      it('does not add null checks for functions on utils', () => {
        const inputWithUtilsFunctionCall = 'valid = utils.fun(input)';
        expect(UtilsOverrides.sanitizeJavaScriptCode(inputWithUtilsFunctionCall)).toBe('valid = utils.fun(input)');
      });

      it('does not add null checks for functions on lodash', () => {
        const inputWithLodashFunctionCall = 'valid = _.fun(input)';
        expect(UtilsOverrides.sanitizeJavaScriptCode(inputWithLodashFunctionCall)).toBe('valid = _.fun(input)');
      });

      it('does not add null checks for nested functions on a reserved word', () => {
        const inputWithNestedFunctionCalls = 'valid = instance.fun1(_.some(data, (a) => util.fun2(a.b.c)))';
        expect(UtilsOverrides.sanitizeJavaScriptCode(inputWithNestedFunctionCalls)).toBe(
          'valid = instance.fun1(_.some(data, (a) => util.fun2((a && a.b && a.b.c))))',
        );
      });

      it('does not add null checks for function calls', () => {
        const inputWithFunctionCall = 'valid = obj.myFunction()';
        expect(UtilsOverrides.sanitizeJavaScriptCode(inputWithFunctionCall)).toBe('valid = obj.myFunction()');

        const inputWithFunctionThatTakesParams = 'valid = obj.myFunction(someInput)';
        expect(UtilsOverrides.sanitizeJavaScriptCode(inputWithFunctionThatTakesParams)).toBe(
          'valid = obj.myFunction(someInput)',
        );

        const inputWithNestedFunctionCall = 'valid = parentObject.childObject.nestedFunction()';
        expect(UtilsOverrides.sanitizeJavaScriptCode(inputWithNestedFunctionCall)).toBe(
          'valid = parentObject.childObject.nestedFunction()',
        );

        const inputWithNestedObjectReferenceAndFunctionCall = 'valid = obj.someVar || obj.someFunction()';
        expect(UtilsOverrides.sanitizeJavaScriptCode(inputWithNestedObjectReferenceAndFunctionCall)).toBe(
          'valid = (obj && obj.someVar) || obj.someFunction()',
        );
      });
    });

    describe('composite component key inside expression', () => {
      it('is not null checked when wrapped in single qoutes', () => {
        const code = "show = utils.isBornBeforeYear(1964, 'container.fnr', submission);";
        expect(UtilsOverrides.sanitizeJavaScriptCode(code)).toBe(code);
      });

      it('is not null checked when wrapped in double qoutes', () => {
        const code = 'show = utils.isBornBeforeYear(1964, "container.fnr", submission);';
        expect(UtilsOverrides.sanitizeJavaScriptCode(code)).toBe(code);
      });
    });
  });

  describe('navFormDiffToHtml', () => {
    it('generates html list with changed properties', () => {
      const changes = {
        status: 'Endring',
        diff: {
          label: { status: 'Endring', originalValue: 'Fornavn', value: 'Oppgi fornavn' },
          id: { status: 'Endring', originalValue: 'ehnemzu', value: 'e6s77h' },
        },
        key: 'fornavn',
        type: 'textfield',
      };
      const diffSummary = formDiffingTool.createDiffSummary(changes);
      const html = UtilsOverrides.navFormDiffToHtml(diffSummary);
      expect(html).toMatchSnapshot();
    });
    it('ignores props whos value changes from undefined to falsy', () => {
      const changes = {
        status: 'Endring',
        diff: {
          label: {
            status: 'Endring',
            originalValue: 'WIP',
            value: 'Svar ja eller nei?',
          },
          validate: {
            status: 'Endring',
            diff: {
              customMessage: {
                status: 'Ny',
                value: '',
              },
              json: {
                status: 'Ny',
                value: '',
              },
            },
          },
          defaultValue: {
            status: 'Ny',
            value: '',
          },
          additionalDescription: {
            status: 'Ny',
            value: false,
          },
        },
        key: 'svarJaEllerNei',
        type: 'radiopanel',
      };
      const diffSummary = formDiffingTool.createDiffSummary(changes);
      const html = UtilsOverrides.navFormDiffToHtml(diffSummary);
      expect(html).toMatchSnapshot();
    });

    it('generates html list with deleted radiopanel from panel', () => {
      const diffSummary = formDiffingTool.createDiffSummary(panelDiffDeletedRadiopanel);
      const html = UtilsOverrides.navFormDiffToHtml(diffSummary);
      expect(html).toMatchSnapshot();
    });

    it('generates nested html list with deleted datagrid and its components', () => {
      const diffSummary = formDiffingTool.createDiffSummary(panelDiffDeletedDatagrid);
      const html = UtilsOverrides.navFormDiffToHtml(diffSummary);
      expect(html).toMatchSnapshot();
    });

    it('handles failure when diffSummary is of unexpected type', () => {
      const originalConsoleError = console.error;
      console.error = () => {};
      try {
        const diffSummary = { some: 'thing', is: 'wrong', with: ['this', 'obj', 'ect'] };
        const html = UtilsOverrides.navFormDiffToHtml(diffSummary);
        expect(html).toMatchSnapshot();
      } catch (e) {
        throw new Error(`Should never fail, but it did: ${e.message}`);
      } finally {
        console.error = originalConsoleError;
      }
    });

    describe('Form -> diff -> html', () => {
      it('empty html when navSelect is not changed', () => {
        const navSelect = navFormUtils.findByNavId('e0a8kbj', publishedForm.components);
        const componentDiff = formDiffingTool.getComponentDiff(navSelect, publishedForm);
        const html = UtilsOverrides.navFormDiffToHtml(componentDiff);
        expect(html).toBe('');
        expect(html).toMatchSnapshot();
      });
      it('should list changes for navSelect', () => {
        const navSelect = navFormUtils.findByNavId('e0a8kbj', formNavSelectChanges.components);
        const componentDiff = formDiffingTool.getComponentDiff(navSelect, publishedForm);
        const html = UtilsOverrides.navFormDiffToHtml(componentDiff);
        expect(html).toMatchSnapshot();
      });
      it('should list changed key', () => {
        const radiopanel = navFormUtils.findByKey('doYouLiveInNorway', formNavSelectChanges.components);
        const componentDiff = formDiffingTool.getComponentDiff(radiopanel, publishedForm);
        const html = UtilsOverrides.navFormDiffToHtml(componentDiff);
        expect(html).toMatchSnapshot();
      });
      it('should list change in conditional', () => {
        const alertstripe = navFormUtils.findByKey('alertstripeArstid', formNavSelectChanges.components);
        const componentDiff = formDiffingTool.getComponentDiff(alertstripe, publishedForm);
        const html = UtilsOverrides.navFormDiffToHtml(componentDiff);
        expect(html).toMatchSnapshot();
      });
    });
  });

  describe('getDiffTag', () => {
    it('returns no tag when component is unchanged', () => {
      const navSelect = navFormUtils.findByNavId('e0a8kbj', publishedForm.components);
      const ctx = {
        builder: true,
        component: navSelect,
        config: {
          publishedForm,
        },
        self: {
          mergeSchema: (comp) => comp,
        },
      };
      const html = UtilsOverrides.getDiffTag(ctx);
      expect(html).toMatchSnapshot();
    });

    it("returns tag 'Endring' when component is changed", () => {
      const navSelect = navFormUtils.findByNavId('e0a8kbj', formNavSelectChanges.components);
      const ctx = {
        builder: true,
        component: navSelect,
        config: {
          publishedForm,
        },
        self: {
          mergeSchema: (comp) => comp,
        },
      };
      const html = UtilsOverrides.getDiffTag(ctx);
      expect(html).toMatchSnapshot();
    });

    it('returns no tag even if component is changed when it renders outside builder', () => {
      const navSelect = navFormUtils.findByNavId('e0a8kbj', formNavSelectChanges.components);
      const ctx = {
        builder: false,
        component: navSelect,
        config: {
          publishedForm,
        },
        self: {
          mergeSchema: (comp) => comp,
        },
      };
      const html = UtilsOverrides.getDiffTag(ctx);
      expect(html).toMatchSnapshot();
    });

    it("returns tag 'Ny' when component does not exist in published form", () => {
      const component = { navId: '123456', key: 'aaaa' };
      const ctx = {
        builder: true,
        component,
        config: {
          publishedForm,
        },
        self: {
          mergeSchema: (comp) => comp,
        },
      };
      const html = UtilsOverrides.getDiffTag(ctx);
      expect(html).toMatchSnapshot();
    });

    describe('component has new default prop in schema', () => {
      const MERGE_SCHEMA_NEW_PROP = (comp) => ({ ...comp, newValue2: true });

      it('returns no tag if component has not changed, only default schema', () => {
        const navSelect = MERGE_SCHEMA_NEW_PROP(navFormUtils.findByNavId('e0a8kbj', publishedForm.components));
        const ctx = {
          builder: true,
          component: navSelect,
          config: {
            publishedForm,
          },
          self: {
            mergeSchema: MERGE_SCHEMA_NEW_PROP,
          },
        };
        const html = UtilsOverrides.getDiffTag(ctx);
        expect(html).toMatchSnapshot();
      });

      it('returns tag "NY" if component does not exist in published form', () => {
        const newComponent = MERGE_SCHEMA_NEW_PROP({
          navId: '123457',
          key: 'bbbb',
          type: 'textfield',
          label: 'Nytt tekstfelt',
        });
        const ctx = {
          builder: true,
          component: newComponent,
          config: {
            publishedForm,
          },
          self: {
            mergeSchema: MERGE_SCHEMA_NEW_PROP,
          },
        };
        const html = UtilsOverrides.getDiffTag(ctx);
        expect(html).toMatchSnapshot();
      });
    });
  });

  describe('isBornBeforeYear', () => {
    it('handles undefined and empty input', () => {
      expect(UtilsOverrides.isBornBeforeYear(1964, 'fnr', undefined)).toBe(false);
      expect(UtilsOverrides.isBornBeforeYear(1964, 'fnr', { data: undefined })).toBe(false);
      expect(UtilsOverrides.isBornBeforeYear(1964, 'fnr', { data: {} })).toBe(false);
    });

    it('handles invalid fnr', () => {
      expect(UtilsOverrides.isBornBeforeYear(1964, 'fnr', { data: { fnr: '11013912345' } })).toBe(false);
    });

    it('parses birth year 55 as 2055', () => {
      const FNR = '31105543487';
      expect(UtilsOverrides.isBornBeforeYear(1954, 'fnr', { data: { fnr: FNR } })).toBe(false);
      expect(UtilsOverrides.isBornBeforeYear(1955, 'fnr', { data: { fnr: FNR } })).toBe(false);
      expect(UtilsOverrides.isBornBeforeYear(1956, 'fnr', { data: { fnr: FNR } })).toBe(false);
      expect(UtilsOverrides.isBornBeforeYear(2054, 'fnr', { data: { fnr: FNR } })).toBe(false);
      expect(UtilsOverrides.isBornBeforeYear(2055, 'fnr', { data: { fnr: FNR } })).toBe(false);
      expect(UtilsOverrides.isBornBeforeYear(2056, 'fnr', { data: { fnr: FNR } })).toBe(true);
    });

    it('parses birth year 56 as 1956', () => {
      const FNR = '01055631685';
      expect(UtilsOverrides.isBornBeforeYear(1955, 'fnr', { data: { fnr: FNR } })).toBe(false);
      expect(UtilsOverrides.isBornBeforeYear(1956, 'fnr', { data: { fnr: FNR } })).toBe(false);
      expect(UtilsOverrides.isBornBeforeYear(1957, 'fnr', { data: { fnr: FNR } })).toBe(true);
      expect(UtilsOverrides.isBornBeforeYear(2054, 'fnr', { data: { fnr: FNR } })).toBe(true);
      expect(UtilsOverrides.isBornBeforeYear(2055, 'fnr', { data: { fnr: FNR } })).toBe(true);
      expect(UtilsOverrides.isBornBeforeYear(2056, 'fnr', { data: { fnr: FNR } })).toBe(true);
    });

    it('parses birth year 39 as 2039', () => {
      const FNR = '11013942015';
      expect(UtilsOverrides.isBornBeforeYear(1938, 'fnr', { data: { fnr: FNR } })).toBe(false);
      expect(UtilsOverrides.isBornBeforeYear(1939, 'fnr', { data: { fnr: FNR } })).toBe(false);
      expect(UtilsOverrides.isBornBeforeYear(1940, 'fnr', { data: { fnr: FNR } })).toBe(false);
      expect(UtilsOverrides.isBornBeforeYear(1941, 'fnr', { data: { fnr: FNR } })).toBe(false);
      expect(UtilsOverrides.isBornBeforeYear(1964, 'fnr', { data: { fnr: FNR } })).toBe(false);
      expect(UtilsOverrides.isBornBeforeYear(2038, 'fnr', { data: { fnr: FNR } })).toBe(false);
      expect(UtilsOverrides.isBornBeforeYear(2039, 'fnr', { data: { fnr: FNR } })).toBe(false);
      expect(UtilsOverrides.isBornBeforeYear(2040, 'fnr', { data: { fnr: FNR } })).toBe(true);
    });

    it('handles composite key', () => {
      const FNR = '01055631685';
      const submission = { data: { fornavn: '', container: { fodselsnummer: FNR } } };
      expect(UtilsOverrides.isBornBeforeYear(1955, 'container.fodselsnummer', submission)).toBe(false);
      expect(UtilsOverrides.isBornBeforeYear(1956, 'container.fodselsnummer', submission)).toBe(false);
      expect(UtilsOverrides.isBornBeforeYear(1957, 'container.fodselsnummer', submission)).toBe(true);
    });
  });

  const pointInTime = (ddmmyyyy) => {
    return moment(ddmmyyyy, 'DD.MM.YYYY');
  };

  describe('getAge', () => {
    it('handles undefined and empty submission', () => {
      expect(UtilsOverrides.getAge('fnr', undefined, pointInTime('15.10.2024'))).toBeUndefined();
      expect(UtilsOverrides.getAge('fnr', {}, pointInTime('15.10.2024'))).toBeUndefined();
      expect(UtilsOverrides.getAge('fnr', { data: undefined }, pointInTime('15.10.2024'))).toBeUndefined();
      expect(UtilsOverrides.getAge('fnr', { data: {} }, pointInTime('15.10.2024'))).toBeUndefined();
      expect(UtilsOverrides.getAge('fnr', { data: { fnr: undefined } }, pointInTime('15.10.2024'))).toBeUndefined();
    });

    it('handles invalid fnr', () => {
      const FNR_INVALID = '01055612345';
      expect(UtilsOverrides.getAge('fnr', { data: { fnr: FNR_INVALID } }, pointInTime('01.05.1957'))).toBeUndefined();
    });

    it('returns correct age', () => {
      const FNR = '01055631685';
      expect(UtilsOverrides.getAge('fnr', { data: { fnr: FNR } }, pointInTime('30.04.1957'))).toBe(0);
      expect(UtilsOverrides.getAge('fnr', { data: { fnr: FNR } }, pointInTime('01.05.1957'))).toBe(1);
      expect(UtilsOverrides.getAge('fnr', { data: { fnr: FNR } }, pointInTime('15.10.2024'))).toBe(68);
    });

    it('handles future fnr', () => {
      const FNR = '06073333138';
      expect(UtilsOverrides.getAge('fnr', { data: { fnr: FNR } }, pointInTime('15.10.2024'))).toBe(-8);
      expect(UtilsOverrides.getAge('fnr', { data: { fnr: FNR } }, pointInTime('06.07.2033'))).toBe(0);
    });
  });

  describe('isAgeBetween', () => {
    it('handles undefined and empty input', () => {
      expect(UtilsOverrides.isAgeBetween([18, 64], 'fnr', undefined)).toBe(false);
      expect(UtilsOverrides.isAgeBetween([18, 64], 'fnr', {})).toBe(false);
      expect(UtilsOverrides.isAgeBetween([18, 64], 'fnr', { data: undefined })).toBe(false);
      expect(UtilsOverrides.isAgeBetween([18, 64], 'fnr', { data: {} })).toBe(false);
    });

    it('checks if age is inside interval', () => {
      const FNR = '01055631685';
      const submission = { data: { fnr: FNR } };

      // lower boundary
      expect(UtilsOverrides.isAgeBetween([18, 64], 'fnr', submission, pointInTime('30.04.1974'))).toBe(false);
      expect(UtilsOverrides.isAgeBetween([18, 64], 'fnr', submission, pointInTime('01.05.1974'))).toBe(true);

      // upper boundary
      expect(UtilsOverrides.isAgeBetween([18, 58], 'fnr', submission, pointInTime('30.04.2015'))).toBe(true);
      expect(UtilsOverrides.isAgeBetween([18, 58], 'fnr', submission, pointInTime('01.05.2015'))).toBe(false);
    });
  });
});
