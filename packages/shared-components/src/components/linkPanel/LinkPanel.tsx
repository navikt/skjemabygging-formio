import { LinkPanel as AkselLinkPanel, LinkPanelProps } from '@navikt/ds-react';
import { ReactElement } from 'react';
import makeStyles from '../../util/styles/jss/jss';

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
  linkPanelContent: {
    display: 'flex',
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginRight: '1.5rem',
    display: 'flex',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    height: '2.75rem',
    width: '2.75rem',
    borderRadius: '6.1875rem',
  },
  iconWrapperPrimary: {
    background: 'var(--surface-default, #FFF)',
  },
  iconWrapperSecondary: {
    background: 'var(--global-deepblue-50, #E6F1F8)',
  },
});

const LinkPanel = ({ title, variant = 'primary', body, icon, className, ...linkPanelProps }: Props) => {
  const styles = useStyles();
  return (
    <div className={className}>
      <AkselLinkPanel
        {...linkPanelProps}
        className={`${styles.linkPanel} ${
          variant === 'secondary' ? styles.linkPanelSecondary : styles.linkPanelPrimary
        }`}
      >
        <div className={styles.linkPanelContent}>
          <div
            className={`${styles.iconWrapper} ${
              variant === 'secondary' ? styles.iconWrapperSecondary : styles.iconWrapperPrimary
            }`}
          >
            {icon}
          </div>
          <div className={styles.mainContent}>
            <AkselLinkPanel.Title>{title}</AkselLinkPanel.Title>
            {body && <AkselLinkPanel.Description>{body}</AkselLinkPanel.Description>}
          </div>
        </div>
      </AkselLinkPanel>
    </div>
  );
};

export default LinkPanel;
