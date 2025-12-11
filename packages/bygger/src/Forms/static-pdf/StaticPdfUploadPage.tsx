import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { AppLayout } from '../../components/AppLayout';
import RowLayout from '../../components/layout/RowLayout';
import Title from '../../components/layout/Title';
import TitleRowLayout from '../../components/layout/TitleRowLayout';

interface Props {
  form: Form;
}
const StaticPdfUploadPage = ({ form }: Props) => {
  const {
    path,
    title,
    properties: { skjemanummer },
  } = form;

  return (
    <AppLayout
      navBarProps={{
        formMenu: true,
        formPath: path,
      }}
    >
      <TitleRowLayout>
        <Title subTitle={skjemanummer}>{title}</Title>
      </TitleRowLayout>
      <RowLayout>New PDF page</RowLayout>
    </AppLayout>
  );
};

export default StaticPdfUploadPage;
