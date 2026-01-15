import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { AppLayout } from '../../components/AppLayout';
import RowLayout from '../../components/layout/RowLayout';
import Title from '../../components/layout/Title';
import TitleRowLayout from '../../components/layout/TitleRowLayout';
import { StaticPdfProvider } from './StaticPdfContext';
import StaticPdfTable from './StaticPdfTable';

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
      <RowLayout>
        <StaticPdfProvider formPath={path}>
          <StaticPdfTable />
        </StaticPdfProvider>
      </RowLayout>
    </AppLayout>
  );
};

export default StaticPdfUploadPage;
