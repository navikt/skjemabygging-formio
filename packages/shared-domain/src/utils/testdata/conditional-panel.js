export default {
  "_id": {"$oid": "123456789"},
  "type": "form",
  "tags": ["nav-skjema", ""],
  "deleted": null,
  "owner": {"$oid": "987654321"},
  "components": [{
    "title": "Steg 1",
    "labelWidth": "",
    "labelMargin": "",
    "theme": "default",
    "breadcrumb": "default",
    "breadcrumbClickable": true,
    "buttonSettings": {"previous": true, "cancel": true, "next": true},
    "navigateOnEnter": false,
    "saveOnEnter": false,
    "scrollToTop": false,
    "tooltip": "",
    "customClass": "",
    "collapsible": false,
    "hidden": false,
    "hideLabel": false,
    "disabled": false,
    "modalEdit": false,
    "key": "veiledning",
    "tags": [],
    "properties": {},
    "customConditional": "",
    "conditional": {"json": "", "show": null, "when": null, "eq": ""},
    "nextPage": "",
    "logic": [],
    "attributes": {},
    "overlay": {"style": "", "page": "", "left": "", "top": "", "width": "", "height": ""},
    "addons": [],
    "type": "panel",
    "label": "Panel",
    "tabindex": "",
    "input": false,
    "components": [{
      "label": "Oppgi yndlingsfarge",
      "fieldSize": "input--xxl",
      "descriptionPosition": "",
      "labelWidth": "",
      "labelMargin": "",
      "description": "",
      "prefix": "",
      "suffix": "",
      "widget": {"type": "input"},
      "displayMask": "",
      "autocomplete": "",
      "showWordCount": false,
      "showCharCount": false,
      "mask": false,
      "spellcheck": true,
      "disabled": false,
      "truncateMultipleSpaces": false,
      "clearOnHide": true,
      "customDefaultValue": "",
      "calculateValue": "",
      "validateOn": "blur",
      "validate": {
        "required": true,
        "minLength": "",
        "maxLength": "",
        "minWords": "",
        "maxWords": "",
        "pattern": "",
        "customMessage": "",
        "custom": "",
        "customPrivate": false,
        "json": "",
        "strictDateValidation": false,
        "multiple": false,
        "unique": false
      },
      "errorLabel": "",
      "errors": "",
      "key": "oppgiYndlingsfarge",
      "tags": [],
      "properties": {},
      "conditional": {"show": null, "when": null, "eq": "", "json": ""},
      "customConditional": "",
      "addons": [],
      "type": "textfield",
      "input": true,
      "dataGridLabel": true,
      "tableView": true,
      "placeholder": "",
      "customClass": "",
      "multiple": false,
      "protected": false,
      "unique": false,
      "persistent": true,
      "hidden": false,
      "refreshOn": "",
      "redrawOn": "",
      "modalEdit": false,
      "labelPosition": "top",
      "tooltip": "",
      "hideLabel": false,
      "tabindex": "",
      "autofocus": false,
      "dbIndex": false,
      "calculateServer": false,
      "attributes": {},
      "overlay": {"style": "", "left": "", "top": "", "width": "", "height": ""},
      "allowCalculateOverride": false,
      "encrypted": false,
      "allowMultipleMasks": false,
      "inputType": "text",
      "inputFormat": "plain",
      "inputMask": "",
      "id": "e83xe9j",
      "defaultValue": ""
    }, {
      "title": "Panel",
      "labelWidth": "",
      "labelMargin": "",
      "theme": "default",
      "tooltip": "",
      "customClass": "",
      "collapsible": false,
      "hidden": false,
      "hideLabel": true,
      "disabled": false,
      "modalEdit": false,
      "key": "minGruppering",
      "tags": [],
      "properties": {},
      "customConditional": "",
      "conditional": {"json": "", "show": null, "when": null, "eq": ""},
      "logic": [],
      "attributes": {},
      "overlay": {"style": "", "page": "", "left": "", "top": "", "width": "", "height": ""},
      "addons": [],
      "type": "panel",
      "label": "Panel",
      "breadcrumb": "default",
      "tabindex": "",
      "input": false,
      "placeholder": "",
      "prefix": "",
      "suffix": "",
      "multiple": false,
      "defaultValue": null,
      "protected": false,
      "unique": false,
      "persistent": false,
      "clearOnHide": false,
      "refreshOn": "",
      "redrawOn": "",
      "tableView": false,
      "dataGridLabel": false,
      "labelPosition": "top",
      "description": "",
      "errorLabel": "",
      "autofocus": false,
      "dbIndex": false,
      "customDefaultValue": "",
      "calculateValue": "",
      "calculateServer": false,
      "widget": null,
      "validateOn": "change",
      "validate": {
        "required": false,
        "custom": "",
        "customPrivate": false,
        "strictDateValidation": false,
        "multiple": false,
        "unique": false
      },
      "allowCalculateOverride": false,
      "encrypted": false,
      "showCharCount": false,
      "showWordCount": false,
      "allowMultipleMasks": false,
      "tree": false,
      "lazyLoad": false,
      "components": [{
        "label": "Hvilken grønn frukt liker du best?",
        "fieldSize": "input--xxl",
        "validateOn": "blur",
        "validate": {
          "required": true,
          "custom": "",
          "customPrivate": false,
          "strictDateValidation": false,
          "multiple": false,
          "unique": false,
          "minLength": "",
          "maxLength": "",
          "pattern": ""
        },
        "key": "hvilkenGronnFruktLikerDuBest",
        "conditional": {"show": true, "when": "oppgiYndlingsfarge", "eq": "grønn"},
        "type": "textfield",
        "input": true,
        "dataGridLabel": true,
        "tableView": true,
        "placeholder": "",
        "prefix": "",
        "customClass": "",
        "suffix": "",
        "multiple": false,
        "defaultValue": null,
        "protected": false,
        "unique": false,
        "persistent": true,
        "hidden": false,
        "clearOnHide": true,
        "refreshOn": "",
        "redrawOn": "",
        "modalEdit": false,
        "labelPosition": "top",
        "description": "",
        "errorLabel": "",
        "tooltip": "",
        "hideLabel": false,
        "tabindex": "",
        "disabled": false,
        "autofocus": false,
        "dbIndex": false,
        "customDefaultValue": "",
        "calculateValue": "",
        "calculateServer": false,
        "widget": {"type": "input"},
        "attributes": {},
        "overlay": {"style": "", "left": "", "top": "", "width": "", "height": ""},
        "allowCalculateOverride": false,
        "encrypted": false,
        "showCharCount": false,
        "showWordCount": false,
        "properties": {},
        "allowMultipleMasks": false,
        "addons": [],
        "mask": false,
        "inputType": "text",
        "inputFormat": "plain",
        "inputMask": "",
        "displayMask": "",
        "spellcheck": true,
        "truncateMultipleSpaces": false,
        "id": "eq4be9"
      }, {
        "label": "Hvilken rød frukt liker du best?",
        "fieldSize": "input--xxl",
        "descriptionPosition": "",
        "labelWidth": "",
        "labelMargin": "",
        "description": "",
        "prefix": "",
        "suffix": "",
        "widget": {"type": "input"},
        "displayMask": "",
        "autocomplete": "",
        "showWordCount": false,
        "showCharCount": false,
        "mask": false,
        "spellcheck": true,
        "disabled": false,
        "truncateMultipleSpaces": false,
        "clearOnHide": true,
        "customDefaultValue": "",
        "calculateValue": "",
        "validateOn": "blur",
        "validate": {
          "required": true,
          "minLength": "",
          "maxLength": "",
          "minWords": "",
          "maxWords": "",
          "pattern": "",
          "customMessage": "",
          "custom": "",
          "customPrivate": false,
          "json": "",
          "strictDateValidation": false,
          "multiple": false,
          "unique": false
        },
        "errorLabel": "",
        "errors": "",
        "key": "hvilkenRodFruktLikerDuBest",
        "tags": [],
        "properties": {},
        "conditional": {"show": true, "when": "oppgiYndlingsfarge", "eq": "rød", "json": ""},
        "customConditional": "",
        "addons": [],
        "type": "textfield",
        "input": true,
        "dataGridLabel": true,
        "placeholder": "",
        "customClass": "",
        "multiple": false,
        "protected": false,
        "unique": false,
        "persistent": true,
        "hidden": false,
        "refreshOn": "",
        "redrawOn": "",
        "tableView": true,
        "modalEdit": false,
        "labelPosition": "top",
        "tooltip": "",
        "hideLabel": false,
        "tabindex": "",
        "autofocus": false,
        "dbIndex": false,
        "calculateServer": false,
        "attributes": {},
        "overlay": {"style": "", "left": "", "top": "", "width": "", "height": ""},
        "allowCalculateOverride": false,
        "encrypted": false,
        "allowMultipleMasks": false,
        "inputType": "text",
        "inputFormat": "plain",
        "inputMask": "",
        "id": "em3qhgj",
        "defaultValue": ""
      }],
      "id": "e34565l"
    }, {
      "labelWidth": "",
      "labelMargin": "",
      "content": "<b>Avokado</b> er mye bedre enn <b>pære</b>",
      "alerttype": "feil",
      "isInline": false,
      "contentForPdf": "",
      "key": "alertstripe",
      "conditional": {"show": true, "when": "hvilkenGronnFruktLikerDuBest", "eq": "pære", "json": ""},
      "customConditional": "",
      "addons": [],
      "type": "alertstripe",
      "label": "Alertstripe",
      "input": true,
      "clearOnHide": true,
      "placeholder": "",
      "prefix": "",
      "customClass": "",
      "suffix": "",
      "multiple": false,
      "defaultValue": null,
      "protected": false,
      "unique": false,
      "persistent": false,
      "hidden": false,
      "refreshOn": "",
      "redrawOn": "",
      "tableView": false,
      "modalEdit": false,
      "dataGridLabel": false,
      "labelPosition": "top",
      "description": "",
      "errorLabel": "",
      "tooltip": "",
      "hideLabel": false,
      "tabindex": "",
      "disabled": false,
      "autofocus": false,
      "dbIndex": false,
      "customDefaultValue": "",
      "calculateValue": "",
      "calculateServer": false,
      "widget": null,
      "attributes": {},
      "validateOn": "change",
      "validate": {
        "required": false,
        "custom": "",
        "customPrivate": false,
        "strictDateValidation": false,
        "multiple": false,
        "unique": false
      },
      "overlay": {"style": "", "left": "", "top": "", "width": "", "height": ""},
      "allowCalculateOverride": false,
      "encrypted": false,
      "showCharCount": false,
      "showWordCount": false,
      "properties": {},
      "allowMultipleMasks": false,
      "tag": "p",
      "attrs": [],
      "id": "eqjwip"
    }],
    "tableView": false,
    "placeholder": "",
    "prefix": "",
    "suffix": "",
    "multiple": false,
    "defaultValue": null,
    "protected": false,
    "unique": false,
    "persistent": false,
    "clearOnHide": false,
    "refreshOn": "",
    "redrawOn": "",
    "dataGridLabel": false,
    "labelPosition": "top",
    "description": "",
    "errorLabel": "",
    "autofocus": false,
    "dbIndex": false,
    "customDefaultValue": "",
    "calculateValue": "",
    "calculateServer": false,
    "widget": null,
    "validateOn": "change",
    "validate": {
      "required": false,
      "custom": "",
      "customPrivate": false,
      "strictDateValidation": false,
      "multiple": false,
      "unique": false
    },
    "allowCalculateOverride": false,
    "encrypted": false,
    "showCharCount": false,
    "showWordCount": false,
    "allowMultipleMasks": false,
    "tree": false,
    "lazyLoad": false,
    "id": "eulpia6"
  }],
  "display": "wizard",
  "name": "wip101116",
  "title": "panel",
  "path": "wip101116",
  "properties": {
    "skjemanummer": "WIP 10-11.16",
    "tema": "CON",
    "innsending": "PAPIR_OG_DIGITAL",
    "hasLabeledSignatures": false,
    "signatures": {"signature1": "", "signature2": "", "signature3": "", "signature4": "", "signature5": ""}
  },
  "machineName": "wip101116",
};
