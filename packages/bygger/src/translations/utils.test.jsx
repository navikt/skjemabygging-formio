import {
  getTextsAndTypeForForm,
  getTextsAndTranslationsForForm,
  getTextsAndTranslationsHeaders,
  parseText,
} from "./utils";
import { MockedComponentObjectForTest } from "@navikt/skjemadigitalisering-shared-components";

const {
  createDummyCheckbox,
  createDummyContainerElement,
  createDummyContentElement,
  createDummyDataGrid,
  createDummyEmail,
  createDummyHTMLElement,
  createDummyNavSkjemagruppe,
  createDummyRadioPanel,
  createDummyTextfield,
  createFormObject,
  createPanelObject,
} = MockedComponentObjectForTest;

describe("testGetAllTextsAndTypeForForm", () => {
  it("Test empty form", () => {
    const actual = getTextsAndTypeForForm(createFormObject([], "test"));
    expect(actual).toEqual([]);
  });
  it("Test form with panel and text fields", () => {
    const actual = getTextsAndTypeForForm(
      createFormObject(
        [
          createPanelObject(
            "Introduksjon",
            [
              createDummyTextfield(),
              createDummyEmail(),
              createDummyTextfield("wktcZylADGp1ewUpfHa6f0DSAhCWjNzDW7b1RJkiigXise0QQaw92SJoMpGvlt8BEL8vAcXRset4KjAIV"),
            ],
            "Introduksjon"
          ),
        ],
        "test"
      )
    );
    expect(actual).toEqual([
      { text: "Introduksjon", type: "text" },
      { text: "Tekstfelt", type: "text" },
      { text: "Email", type: "text" },
      { text: "wktcZylADGp1ewUpfHa6f0DSAhCWjNzDW7b1RJkiigXise0QQaw92SJoMpGvlt8BEL8vAcXRset4KjAIV", type: "textarea" },
    ]);
  });
  it("Test form with panel, html elements and contents", () => {
    const actual = getTextsAndTypeForForm(
      createFormObject(
        [
          createPanelObject(
            "Introduksjon",
            [
              createDummyHTMLElement("HTML", "Test html element"),
              createDummyHTMLElement(
                "HTML",
                "VB2fDXfOP4frsF1EAggorIU2H4jdosE4J3jYQYn0vZGtqK5yqVWAFLPelnffebNBKxMaUbQ4IKFp6QsD9"
              ),
              createDummyContentElement("Content", "Test content"),
              createDummyContentElement(
                "Content",
                "VrcUdaapouM1tt1nPQmW4qlUs7P0bbkAoiFLHyRmP0qlkDCptvszDEntC5iGZB2hkkBgYkU8I8CQzwgn1"
              ),
            ],
            "Introduksjon"
          ),
        ],
        "test"
      )
    );
    expect(actual).toEqual([
      { text: "Introduksjon", type: "text" },
      { text: "Test html element", type: "text" },
      { text: "VB2fDXfOP4frsF1EAggorIU2H4jdosE4J3jYQYn0vZGtqK5yqVWAFLPelnffebNBKxMaUbQ4IKFp6QsD9", type: "textarea" },
      { text: "Test content", type: "text" },
      { text: "VrcUdaapouM1tt1nPQmW4qlUs7P0bbkAoiFLHyRmP0qlkDCptvszDEntC5iGZB2hkkBgYkU8I8CQzwgn1", type: "textarea" },
    ]);
  });
  it("Test form with panel, skjemagruppe and radio panel", () => {
    const actual = getTextsAndTypeForForm(
      createFormObject(
        [
          createPanelObject(
            "Introduksjon",
            [
              createDummyNavSkjemagruppe("NavSkjemagruppe", [
                createDummyRadioPanel(),
                createDummyRadioPanel(
                  "FlGufFRHJLytgypGcRa0kqP1M9mgYTC8FZWCTJTn7sVnfqDWDNQI0eT5TvovfWB3oWDVwrBqBfLThXeUF"
                ),
              ]),
            ],
            "Introduksjon"
          ),
        ],
        "test"
      )
    );
    expect(actual).toEqual([
      { text: "Introduksjon", type: "text" },
      { text: "NavSkjemagruppe-legend", type: "text" },
      { text: "RadioPanel", type: "text" },
      { text: "NO-label", type: "text" },
      { text: "YES-label", type: "text" },
      { text: "FlGufFRHJLytgypGcRa0kqP1M9mgYTC8FZWCTJTn7sVnfqDWDNQI0eT5TvovfWB3oWDVwrBqBfLThXeUF", type: "textarea" },
    ]);
  });
  it("Test form with panel, skjemagruppe, datagrid and radio panel", () => {
    const actual = getTextsAndTypeForForm(
      createFormObject(
        [
          createPanelObject(
            "Introduksjon",
            [
              createDummyNavSkjemagruppe("NavSkjemagruppe", [
                createDummyRadioPanel(),
                createDummyRadioPanel(
                  "FlGufFRHJLytgypGcRa0kqP1M9mgYTC8FZWCTJTn7sVnfqDWDNQI0eT5TvovfWB3oWDVwrBqBfLThXeUF"
                ),
                createDummyDataGrid("DataGrid", [createDummyRadioPanel("Radio panel inside data grid")]),
                createDummyDataGrid(
                  "DataGrid",
                  [createDummyRadioPanel("Radio panel inside data grid without label")],
                  true
                ),
              ]),
            ],
            "Introduksjon"
          ),
        ],
        "test"
      )
    );
    expect(actual).toEqual([
      { text: "Introduksjon", type: "text" },
      { text: "NavSkjemagruppe-legend", type: "text" },
      { text: "RadioPanel", type: "text" },
      { text: "NO-label", type: "text" },
      { text: "YES-label", type: "text" },
      { text: "FlGufFRHJLytgypGcRa0kqP1M9mgYTC8FZWCTJTn7sVnfqDWDNQI0eT5TvovfWB3oWDVwrBqBfLThXeUF", type: "textarea" },
      { text: "DataGrid", type: "text" },
      { text: "Radio panel inside data grid", type: "text" },
      { text: "Radio panel inside data grid without label", type: "text" },
    ]);
  });
  it("Test form with panel, container and checkbox", () => {
    const actual = getTextsAndTypeForForm(
      createFormObject(
        [
          createPanelObject(
            "Introduksjon",
            [
              createDummyContainerElement("Container", [
                createDummyCheckbox(),
                createDummyCheckbox(
                  "zJ6lzq1ED1N7yDoi0J892Vbk3Wt1qwTQOlr7R639KAq1Xlzlf3tXozLD5a3abswyyl7qE9wcUlJWddlUV"
                ),
              ]),
              createDummyContainerElement(
                "Container",
                [
                  createDummyCheckbox("NavCheckbox in a container without label"),
                  createDummyCheckbox(
                    "RyiX3OuRGRdTT1AIoP6qK2MLGPkXdij36yFs0NiTY1WfptfYkuY0cBZOIk4mLLMJWgEEt0SpaQUojObrM"
                  ),
                ],
                true
              ),
            ],
            "Introduksjon"
          ),
        ],
        "test"
      )
    );
    expect(actual).toEqual([
      { text: "Introduksjon", type: "text" },
      { text: "Container", type: "text" },
      { text: "NavCheckbox", type: "text" },
      { text: "zJ6lzq1ED1N7yDoi0J892Vbk3Wt1qwTQOlr7R639KAq1Xlzlf3tXozLD5a3abswyyl7qE9wcUlJWddlUV", type: "textarea" },
      { text: "NavCheckbox in a container without label", type: "text" },
      { text: "RyiX3OuRGRdTT1AIoP6qK2MLGPkXdij36yFs0NiTY1WfptfYkuY0cBZOIk4mLLMJWgEEt0SpaQUojObrM", type: "textarea" },
    ]);
  });
  it("Test form with panel and text field with suffix and prefix", () => {
    const actual = getTextsAndTypeForForm(
      createFormObject(
        [
          createPanelObject(
            "Introduksjon",
            [
              { ...createDummyTextfield(), suffix: "centimeter" },
              { ...createDummyTextfield(), prefix: "+47" },
              createDummyTextfield("wktcZylADGp1ewUpfHa6f0DSAhCWjNzDW7b1RJkiigXise0QQaw92SJoMpGvlt8BEL8vAcXRset4KjAIV"),
            ],
            "Introduksjon"
          ),
        ],
        "test"
      )
    );
    expect(actual).toEqual([
      { text: "Introduksjon", type: "text" },
      { text: "Tekstfelt", type: "text" },
      { text: "centimeter", type: "text" },
      { text: "+47", type: "text" },
      { text: "wktcZylADGp1ewUpfHa6f0DSAhCWjNzDW7b1RJkiigXise0QQaw92SJoMpGvlt8BEL8vAcXRset4KjAIV", type: "textarea" },
    ]);
  });
  it("Test form with duplicated text field", () => {
    const actual = getTextsAndTypeForForm(
      createFormObject(
        [
          createPanelObject(
            "Introduksjon",
            [createDummyTextfield("same textfield"), createDummyEmail(), createDummyTextfield("same textfield")],
            "Introduksjon"
          ),
        ],
        "test"
      )
    );
    expect(actual).toEqual([
      { text: "Introduksjon", type: "text" },
      { text: "same textfield", type: "text" },
      { text: "Email", type: "text" },
    ]);
  });
});
describe("testGetTextsAndTranslationsForForm", () => {
  const form = createFormObject(
    [createPanelObject("Introduksjon", [createDummyTextfield("Ja")], [createDummyTextfield("Jeg")], "Introduksjon")],
    "test"
  );
  const translations = {
    en: { id: "123", translations: { Ja: { value: "Yes", scope: "global" } } },
    "nn-NO": { id: "2345", translations: { Jeg: { value: "Eg", scope: "global" } } },
  };

  it("Test form with translations", () => {
    const actual = getTextsAndTranslationsForForm(form, translations);
    expect(actual).toEqual([{ text: "test" }, { text: "Introduksjon" }, { text: "Ja", en: "Yes" }]);
  });
});
describe("testGetCSVfileHeaders", () => {
  it("Test headers with only origin form text", () => {
    const actual = getTextsAndTranslationsHeaders([]);
    expect(actual).toEqual([{ key: "text", label: "Skjematekster" }]);
  });

  it("Test headers with origin form text and language code", () => {
    const actual = getTextsAndTranslationsHeaders({ en: {}, "nn-NO": {} });
    expect(actual).toEqual([
      { key: "text", label: "Skjematekster" },
      { key: "en", label: "EN" },
      { key: "nn-NO", label: "NN-NO" },
    ]);
  });
});
describe("testParsingTextWithHTMLTag", () => {
  it("Test form text with HTML element", () => {
    const actual = parseText(
      '<h3>Eventuell utbetaling av AAP</h3> Du kan bare ha ett kontonummer registrert hos NAV. Du kan enkelt <a href="https://www.nav.no/soknader/nb/person/diverse/endre-opplysninger-om-bankkontonummer#papirsoknader" target="_blank"> endre hvilket kontonummer vi benytter (åpnes i ny fane)</a>. <br/> '
    );
    expect(actual).toEqual(
      "Eventuell utbetaling av AAP Du kan bare ha ett kontonummer registrert hos NAV. Du kan enkelt (https://www.nav.no/soknader/nb/person/diverse/endre-opplysninger-om-bankkontonummer#papirsoknader)  endre hvilket kontonummer vi benytter (åpnes i ny fane).  "
    );
  });

  it("Test form text with HTML element besides a tag", () => {
    const actual = parseText(
      "<p>Hvis du er gjenlevende ektefelle/partner/samboer eller ugift familiepleier kan du bruke dette skjema til å søke på</p><ul><li>Stønad til barnetilsyn på grunn av arbeid</li><li>Stønad til skolepenger</li></ul><p>Stønad til barnetilsyn gjelder kun utgifter du har til barnepass mens du studerer eller jobber. Studiene dine må være offentlig godkjent for at du skal få skolepenger.</p>"
    );
    expect(actual).toEqual(
      "Hvis du er gjenlevende ektefelle/partner/samboer eller ugift familiepleier kan du bruke dette skjema til å søke påStønad til barnetilsyn på grunn av arbeidStønad til skolepengerStønad til barnetilsyn gjelder kun utgifter du har til barnepass mens du studerer eller jobber. Studiene dine må være offentlig godkjent for at du skal få skolepenger."
    );
  });

  it("Test form text with only a tag when there is no space before link ", () => {
    const actual = parseText('<a href="hello.hello.world">test</a>');
    expect(actual).toEqual("(hello.hello.world)test");
  });

  it("Test form text with only a tag when there is target attribute", () => {
    const actual = parseText('<a href="hello.hello.world" target="_blank">test</a>');
    expect(actual).toEqual("(hello.hello.world) test");
  });

  it("Test form text with only a tag when there is space before link", () => {
    const actual = parseText('<a href= "hello.hello.world">test</a>');
    expect(actual).toEqual("test");
  });
});
