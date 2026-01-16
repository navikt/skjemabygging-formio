import { useState } from 'react';
import StaticPdfDownloadPage from './StaticPdfDownloadPage';
import StaticPdfInputPage from './StaticPdfInputPage';
import StaticPdfNavigation from './components/StaticPdfNavigation';

type StaticPdfPage = 'input' | 'download';

const StaticPdfPage = () => {
  const [page, setPage] = useState<StaticPdfPage>('input');

  return (
    <>
      {page === 'input' ? <StaticPdfInputPage /> : page === 'download' ? <StaticPdfDownloadPage /> : null}
      <StaticPdfNavigation page={page} setPage={setPage} />
    </>
  );
};

export default StaticPdfPage;
export type { StaticPdfPage };
