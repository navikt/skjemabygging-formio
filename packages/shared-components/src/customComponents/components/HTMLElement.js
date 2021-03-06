import HTMLElement from "formiojs/components/html/HTML";
import HTMLElementEditForm from "formiojs/components/html/HTML.form";
import HTMLElementDisplayEditForm from "formiojs/components/html/editForm/HTML.edit.display";
import { contentToIncludeInPdf } from "./fields/contentToIncludeInPdf";

HTMLElement.editForm = (...extend) =>
  HTMLElementEditForm([
    {
      label: "Display",
      key: "display",
      components: [...HTMLElementDisplayEditForm, contentToIncludeInPdf],
    },
    ...extend,
  ]);

export default HTMLElement;
