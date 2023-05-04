import NumberDisplayEditForm from "formiojs/components/number/editForm/Number.edit.display";
import Number from "formiojs/components/number/Number";
import NumberEditForm from "formiojs/components/number/Number.form";
import { advancedDescription } from "./fields/advancedDescription.js";
import { fieldSizeField } from "./fields/fieldSize";

Number.editForm = () => {
  return NumberEditForm([
    {
      label: "Display",
      key: "display",
      components: [
        ...NumberDisplayEditForm,
        fieldSizeField,
        ...advancedDescription,
        {
          key: "placeholder",
          ignore: true,
        },
        {
          key: "labelPosition",
          ignore: true,
        },
        {
          key: "tabindex",
          ignore: true,
        },
        {
          key: "tooltip",
          ignore: true,
        },
        {
          key: "customClass",
          ignore: true,
        },
        {
          key: "hidden",
          ignore: true,
        },
        {
          key: "hideLabel",
          ignore: true,
        },
        {
          key: "autofocus",
          ignore: true,
        },
        {
          key: "tableView",
          ignore: true,
        },
        {
          key: "modalEdit",
          ignore: true,
        },
        {
          key: "widget.type",
          ignore: true,
        },
        {
          key: "inputMask",
          ignore: true,
        },
        {
          key: "allowMultipleMasks",
          ignore: true,
        },
        {
          key: "mask",
          ignore: true,
        },
        {
          key: "spellcheck",
          ignore: true,
        },
        { key: "displayMask", ignore: true },
        { key: "autocomplete", ignore: true },
        { key: "disabled", ignore: true },
      ],
    },
    {
      key: "data",
      components: [
        {
          key: "multiple",
          ignore: true,
        },
        {
          key: "persistent",
          ignore: true,
        },
        {
          key: "inputFormat",
          ignore: true,
        },
        {
          key: "protected",
          ignore: true,
        },
        {
          key: "dbIndex",
          ignore: true,
        },
        {
          key: "case",
          ignore: true,
        },
        {
          key: "encrypted",
          ignore: true,
        },
        {
          key: "redrawOn",
          ignore: true,
        },
        {
          key: "calculateServer",
          ignore: true,
        },
        {
          key: "allowCalculateOverride",
          ignore: true,
        },
        { key: "truncateMultipleSpaces", ignore: true },
        { key: "decimalLimit", ignore: true },
        { key: "requireDecimal", ignore: true },
      ],
    },
    {
      key: "validation",
      components: [
        {
          key: "unique",
          ignore: true,
        },
        { key: "validateOn", ignore: true },
      ],
    },
    {
      key: "api",
      components: [
        { key: "tags", ignore: true },
        { key: "properties", ignore: true },
      ],
    },
    {
      key: "logic",
      ignore: true,
      components: false,
    },
    {
      key: "layout",
      ignore: true,
      components: false,
    },
  ]);
};

export default Number;
