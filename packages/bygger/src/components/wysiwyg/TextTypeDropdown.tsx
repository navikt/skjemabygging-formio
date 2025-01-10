import { createDropdown } from 'react-simple-wysiwyg';

const TextTypeDropdown = createDropdown('Skrifttype', [
  ['Uten formatering', 'formatBlock', 'DIV'],
  ['Avsnitt', 'formatBlock', 'P'],
  ['Overskrift', 'formatBlock', 'H3'],
  ['Underoverskrift', 'formatBlock', 'H4'],
]);

export default TextTypeDropdown;
