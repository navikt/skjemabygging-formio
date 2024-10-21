import { AppLayout } from '../components/AppLayout';
import Title from '../components/layout/Title';
import TitleRowLayout from '../components/layout/TitleRowLayout';
import RecipientsProvider from '../context/recipients/RecipientsContext';
import Recipients from './Recipients';

const RecipientsPage = () => {
  return (
    <AppLayout>
      <TitleRowLayout>
        <Title>Mottakere</Title>
      </TitleRowLayout>
      <RecipientsProvider>
        <Recipients />
      </RecipientsProvider>
    </AppLayout>
  );
};
export default RecipientsPage;
