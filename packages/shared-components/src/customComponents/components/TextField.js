import TextFieldDisplayEditForm from "formiojs/components/textfield/editForm/TextField.edit.display";
import TextField from "formiojs/components/textfield/TextField";
import TextFieldEditForm from "formiojs/components/textfield/TextField.form";
import { advancedDescription } from "./fields/advancedDescription.js";
import { fieldSizeField } from "./fields/fieldSize";

TextField.editForm = () => {
  return TextFieldEditForm([
    {
      label: "Display",
      key: "display",
      components: [
        ...TextFieldDisplayEditForm,
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
        { key: "showWordCount", ignore: true },
        { key: "showCharCount", ignore: true },
        { key: "hideInput", ignore: true },
        { key: "disabled", ignore: true },
        { key: "displayMask", ignore: true },
        { key: "mask", ignore: true },
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
        { key: "validate.minWords", ignore: true },
        { key: "validate.maxWords", ignore: true },
        { key: "validate.pattern", ignore: true },
        { key: "minWordLength", ignore: true },
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

export default TextField;
