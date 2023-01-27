import TextAreaDisplayEditForm from "formiojs/components/textarea/editForm/TextArea.edit.display";
import TextArea from "formiojs/components/textarea/TextArea";
import TextAreaEditForm from "formiojs/components/textarea/TextArea.form";
import { advancedDescription } from "./fields/advancedDescription.js";

TextArea.editForm = () => {
  return TextAreaEditForm([
    {
      label: "Display",
      key: "display",
      components: [
        ...TextAreaDisplayEditForm,
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
          key: "editor",
          ignore: true,
        },
        {
          key: "rows",
          ignore: true,
        },
        { key: "prefix", ignore: true },
        { key: "suffix", ignore: true },
        { key: "displayMask", ignore: true },
        { key: "autoExpand", ignore: true },
        { key: "autocomplete", ignore: true },
        { key: "showWordCount", ignore: true },
        { key: "showCharCount", ignore: true },
        { key: "spellcheck", ignore: true },
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

export default TextArea;
