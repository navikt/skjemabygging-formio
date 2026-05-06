import { Box, List } from '@navikt/ds-react';
import makeStyles from '../../../util/styles/jss/jss';
import InnerHtml from '../../inner-html/InnerHtml';

const useStyles = makeStyles({
  content: {
    '& > :first-child': {
      marginBlockStart: 0,
    },
    '& > :last-child': {
      marginBlockEnd: 0,
    },
    '& > h4:last-child, & > h4:first-child': {
      lineHeight: 'var(--ax-font-line-height-heading-small)',
    },
  },
});

interface Props {
  values?: string[];
}

const IntroBulletPoints = ({ values }: Props) => {
  const styles = useStyles();

  if (!values?.length) {
    return null;
  }

  return (
    <Box marginBlock="space-16" asChild>
      <List data-aksel-migrated-v8>
        {values.map((item, index) => (
          <List.Item key={index}>
            <InnerHtml content={item} className={styles.content} />
          </List.Item>
        ))}
      </List>
    </Box>
  );
};

export default IntroBulletPoints;
