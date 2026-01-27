import { Box, List } from '@navikt/ds-react';
import InnerHtml from '../../inner-html/InnerHtml';

interface Props {
  values?: string[];
}

const IntroBulletPoints = ({ values }: Props) => {
  if (!values?.length) {
    return null;
  }

  return (
    <Box marginBlock="space-16" asChild>
      <List data-aksel-migrated-v8>
        {values.map((item, index) => (
          <List.Item key={index}>
            <InnerHtml content={item} />
          </List.Item>
        ))}
      </List>
    </Box>
  );
};

export default IntroBulletPoints;
