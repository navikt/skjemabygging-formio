import { List } from '@navikt/ds-react';
import InnerHtmlShort from '../../inner-html/InnerHtmlShort';

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
          <InnerHtmlShort content={item} />
        </List.Item>
      ))}
    </List>
  );
};

export default IntroBulletPoints;
