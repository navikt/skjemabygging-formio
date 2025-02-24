import { LinkIcon } from '@navikt/aksel-icons';
import { createButton } from 'react-simple-wysiwyg';

const LinkButton = createButton('Link', <LinkIcon title="Link" fontSize="1.5rem" />, ({ $selection }) => {
  if ($selection?.nodeName === 'A') {
    document.execCommand('unlink');
  } else {
    const Selection = document.getSelection()?.toString();
    const Uri = prompt('URL', '');
    document.execCommand(
      'insertHTML',
      false,
      Uri ? `<a href="${Uri}" target="_blank" rel="noopener noreferrer">${Selection ? Selection : Uri}</a>` : Selection,
    );
  }
});

export default LinkButton;
