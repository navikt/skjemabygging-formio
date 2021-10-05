export default {
  "_id": {"$oid": "123456789"},
  "type": "form",
  "tags": ["nav-skjema", ""],
  "deleted": null,
  "owner": {"$oid": "987654321"},
  "components": [{
    "type": "panel",
    "input": false,
    "title": "Dine opplysninger",
    "key": "personopplysninger",
    "theme": "default",
    "components": [{
      "label": "Hva er ditt navn?",
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
      "key": "hvaErDittNavn",
      "tags": [],
      "properties": {},
      "conditional": {"show": null, "when": null, "eq": "", "json": ""},
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
      "id": "ey09b4m",
      "defaultValue": ""
    }, {
      "title": "Tilbakemelding",
      "labelWidth": "",
      "labelMargin": "",
      "theme": "default",
      "tooltip": "",
      "customClass": "",
      "collapsible": false,
      "hidden": false,
      "hideLabel": false,
      "disabled": false,
      "modalEdit": false,
      "key": "tilbakemelding",
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
        "label": "Hva er din favorittårstid?",
        "descriptionPosition": "",
        "labelWidth": "",
        "labelMargin": "",
        "description": "",
        "hideLabel": false,
        "values": [{"value": "var", "label": "vår", "shortcut": ""}, {
          "value": "sommer",
          "label": "sommer",
          "shortcut": ""
        }, {"label": "høst", "value": "host", "shortcut": ""}, {
          "label": "vinter",
          "value": "vinter",
          "shortcut": ""
        }],
        "clearOnHide": true,
        "customDefaultValue": "",
        "calculateValue": "",
        "validate": {
          "required": false,
          "onlyAvailableItems": false,
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
        "key": "toggle",
        "tags": [],
        "properties": {},
        "conditional": {"show": null, "when": null, "eq": "", "json": ""},
        "customConditional": "",
        "addons": [],
        "type": "radiopanel",
        "tableView": false,
        "validateOn": "blur",
        "input": true,
        "placeholder": "",
        "prefix": "",
        "customClass": "",
        "suffix": "",
        "multiple": false,
        "protected": false,
        "unique": false,
        "persistent": true,
        "hidden": false,
        "refreshOn": "",
        "redrawOn": "",
        "modalEdit": false,
        "dataGridLabel": false,
        "labelPosition": "top",
        "tooltip": "",
        "tabindex": "",
        "disabled": false,
        "autofocus": false,
        "dbIndex": false,
        "calculateServer": false,
        "widget": null,
        "attributes": {},
        "overlay": {"style": "", "left": "", "top": "", "width": "", "height": ""},
        "allowCalculateOverride": false,
        "encrypted": false,
        "showCharCount": false,
        "showWordCount": false,
        "allowMultipleMasks": false,
        "inputType": "radio",
        "fieldSet": false,
        "id": "e0n4i9",
        "defaultValue": ""
      }, {
        "label": "Hvorfor sommer?",
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
        "key": "hvorforSommer",
        "tags": [],
        "properties": {},
        "conditional": {"show": true, "when": "toggle", "eq": "sommer", "json": ""},
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
        "id": "e0n57wh",
        "defaultValue": ""
      }],
      "id": "e8fggu"
    }, {
      "label": "Oppgi din favorittfarge",
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
      "key": "oppgiDinFavorittfarge",
      "tags": [],
      "properties": {},
      "conditional": {"show": true, "when": "toggle", "eq": "vinter", "json": ""},
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
      "id": "er5wky4j",
      "defaultValue": ""
    }],
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
    "clearOnHide": false,
    "refreshOn": "",
    "redrawOn": "",
    "tableView": false,
    "modalEdit": false,
    "label": "Panel",
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
    "conditional": {"show": null, "when": null, "eq": ""},
    "overlay": {"style": "", "left": "", "top": "", "width": "", "height": ""},
    "allowCalculateOverride": false,
    "encrypted": false,
    "showCharCount": false,
    "showWordCount": false,
    "properties": {},
    "allowMultipleMasks": false,
    "addons": [],
    "tree": false,
    "lazyLoad": false,
    "breadcrumb": "default",
    "id": "e1xrfj"
  }],
  "display": "wizard",
  "name": "wip101115",
  "title": "Testskjema",
  "path": "wip101115",
  "properties": {
    "skjemanummer": "WIP 10-11.15",
    "tema": "NED",
    "innsending": "PAPIR_OG_DIGITAL",
    "hasLabeledSignatures": false,
    "signatures": {"signature1": "", "signature2": "", "signature3": "", "signature4": "", "signature5": ""}
  },
  "machineName": "wip101115"
}