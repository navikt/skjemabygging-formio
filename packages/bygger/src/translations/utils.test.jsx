import { getAllTextsForForm } from "./utils";
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

describe("testGetAllTextsForForm", () => {
  it("Test empty form", () => {
    const actual = getAllTextsForForm(createFormObject([], "test"));
    expect(actual).toEqual([]);
  });

  it("Test form with panel and text fields", () => {
    const actual = getAllTextsForForm(
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
    const actual = getAllTextsForForm(
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
    const actual = getAllTextsForForm(
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
    const actual = getAllTextsForForm(
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
    const actual = getAllTextsForForm(
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
});
