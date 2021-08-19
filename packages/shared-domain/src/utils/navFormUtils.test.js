import {formMatcherPredicate, toFormPath} from "./navFormUtils";

describe('navFormUtils', () => {

  describe('toFormPath', () => {

    it('should create path from skjemanummer', () => {
      expect(toFormPath('NAV 10-13.76')).toEqual('nav101376');
    });

    it('should create path from title (legacy)', () => {
      expect(toFormPath('Erklæring fra ergo- eller fysioterapeut i forbindelse med søknad om motorkjøretøy og / eller spesialutstyr og tilpassing'))
        .toEqual('erklaeringfraergoellerfysioterapeutiforbindelsemedsoknadommotorkjoretoyogellerspesialutstyrogtilpassing');
      expect(toFormPath('Søknad om forlenget barnepensjon etter fylte 18 år'))
        .toEqual('soknadomforlengetbarnepensjonetterfylte18ar');
      expect(toFormPath('Søknad om utstedelse av attest PD U2'))
        .toEqual('soknadomutstedelseavattestpdu2');
      expect(toFormPath('Underveis- og sluttevaluering av AMO-KURS'))
        .toEqual('underveisogsluttevalueringavamokurs');
    });

  });

  describe('formMatcherPredicate', () => {

    const createForm = (title, path, skjemanummer) => ({
      title,
      path,
      properties: {
        skjemanummer
      }
    });

    describe('A form where path is derived from title (legacy)', () => {

      const form = createForm(
        'First test form',
        'firsttestform',
        'NAV 12-34.56'
      );

      it('should match the path', () => {
        expect(formMatcherPredicate('firsttestform')(form)).toBe(true);
      });

      it('should match the skjemanummer', () => {
        expect(formMatcherPredicate('nav123456')(form)).toBe(true);
      });

      it('should not match other skjemanummer', () => {
        expect(formMatcherPredicate('nav654321')(form)).toBe(false);
      });

      it('should not match other title', () => {
        expect(formMatcherPredicate('secondtestform')(form)).toBe(false);
      });

    });

    describe('A form where the path is derived from skjemanummer', () => {

      const form = createForm(
        'Second test form',
        'nav123456',
        'NAV 12-34.56'
      );

      it('should match the path', () => {
        expect(formMatcherPredicate('nav123456')(form)).toBe(true);
      });

      it('should match the title (legacy)', () => {
        expect(formMatcherPredicate('secondtestform')(form)).toBe(true);
      });

      it('should not match other skjemanummer', () => {
        expect(formMatcherPredicate('nav654321')(form)).toBe(false);
      });

    });

  });

});
