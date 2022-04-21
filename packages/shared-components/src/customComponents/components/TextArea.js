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
      ],
    },
    {
      key: "validation",
      components: [
        {
          key: "unique",
          ignore: true,
        },
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
