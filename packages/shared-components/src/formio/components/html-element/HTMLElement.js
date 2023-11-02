import HTMLElement from 'formiojs/components/html/HTML';
import HTMLElementEditForm from 'formiojs/components/html/HTML.form';
import HTMLElementDisplayEditForm from 'formiojs/components/html/editForm/HTML.edit.display';
import { contentToIncludeInPdf } from '../fields/contentToIncludeInPdf';

HTMLElement.editForm = (...extend) =>
  HTMLElementEditForm([
    {
      label: 'Display',
      key: 'display',
      components: [
        ...HTMLElementDisplayEditForm,
        contentToIncludeInPdf,
        { key: 'attrs', ignore: true },
        { key: 'refreshOnChange', ignore: true },
        { key: 'customClass', ignore: true },
        { key: 'className', ignore: true },
        { key: 'hidden', ignore: true },
        { key: 'modalEdit', ignore: true },
      ],
    },
    {
      key: 'api',
      components: [
        { key: 'tags', ignore: true },
        { key: 'properties', ignore: true },
      ],
    },
    {
      key: 'logic',
      ignore: true,
      components: false,
    },
    {
      key: 'layout',
      ignore: true,
      components: false,
    },

    ...extend,
  ]);

HTMLElement.prototype.addNavClassNames = (text) =>
  text.replace(/<h3/g, "<h3 class='typo-undertittel'").replace(/<a/g, "<a class='lenke'");

export default HTMLElement;
