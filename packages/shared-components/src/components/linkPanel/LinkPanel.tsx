import { LinkPanel as AkselLinkPanel } from '@navikt/ds-react';
import { ReactElement } from 'react';

type Props = {
  href: string;
  title: string;
  body?: string;
  icon?: ReactElement;
  key?: string;
};
const LinkPanel = ({ key, href, title, body, icon }: Props) => {
  return (
    <AkselLinkPanel href={href} key={key}>
      {icon}
      <AkselLinkPanel.Title>{title}</AkselLinkPanel.Title>
      <AkselLinkPanel.Description>{body}</AkselLinkPanel.Description>
    </AkselLinkPanel>
  );
};

export default LinkPanel;
