import { LinkPanel as AkselLinkPanel, LinkPanelProps } from '@navikt/ds-react';
import { ReactElement } from 'react';
import makeStyles from '../../util/jss';

interface Props extends LinkPanelProps {
  variant?: 'primary' | 'secondary';
  title: string;
  body?: string;
  icon?: ReactElement;
}

const useStyles = makeStyles({
  linkPanel: {
    minHeight: '4.75rem',
    borderRadius: '0.25rem',
  },
  linkPanelPrimary: {
    border: '1px solid var(--border-subtle, rgba(0, 0, 0, 0.10))',
    background: 'var(--global-deepblue-50, #E6F1F8)',
  },
  linkPanelSecondary: {
    border: '1px dashed var(--border-strong, rgba(1, 11, 24, 0.68))',
    background: 'var(--surface-default, #FFF)',
  },
});

const LinkPanel = ({ title, variant = 'primary', body, icon, className, ...linkPanelProps }: Props) => {
  console.log('props', { title, variant, className });
  const styles = useStyles();
  return (
    <div className={className}>
      <AkselLinkPanel
        {...linkPanelProps}
        className={`${styles.linkPanel} ${
          variant === 'secondary' ? styles.linkPanelSecondary : styles.linkPanelPrimary
        }`}
      >
        {icon}
        <AkselLinkPanel.Title>{title}</AkselLinkPanel.Title>
        <AkselLinkPanel.Description>{body}</AkselLinkPanel.Description>
      </AkselLinkPanel>
    </div>
  );
};

export default LinkPanel;
