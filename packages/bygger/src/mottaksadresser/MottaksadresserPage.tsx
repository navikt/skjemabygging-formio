import { AppLayout } from '../components/AppLayout';
import Title from '../components/layout/Title';
import TitleRowLayout from '../components/layout/TitleRowLayout';
import MottaksadresserListe from './MottaksadresserListe';

const MottaksadresserPage = () => {
  return (
    <AppLayout>
      <TitleRowLayout>
        <Title>Mottaksadresser</Title>
      </TitleRowLayout>

      <MottaksadresserListe />
    </AppLayout>
  );
};

export default MottaksadresserPage;
