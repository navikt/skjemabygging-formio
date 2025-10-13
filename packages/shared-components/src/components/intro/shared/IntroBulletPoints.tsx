import { List } from '@navikt/ds-react';
import InnerHtml from '../../inner-html/InnerHtml';

interface Props {
  values?: string[];
}

const IntroBulletPoints = ({ values }: Props) => {
  if (!values?.length) {
    return null;
  }

  return (
    <List>
      {values.map((item, index) => (
        <List.Item key={index}>
          <InnerHtml content={item} />
        </List.Item>
      ))}
    </List>
  );
};

export default IntroBulletPoints;
