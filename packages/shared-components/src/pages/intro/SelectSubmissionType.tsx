import DigitalLinkPanel from './LinkPanels/DigitalLinkPanel';
import DigitalNoLoginLinkPanel from './LinkPanels/DigitalNoLoginLinkPanel';
import NoLoginLinkPanel from './LinkPanels/NoLoginLinkPanel';
import PaperLinkPanel from './LinkPanels/PaperLinkPanel';

const SelectSubmissionType = () => {
  return (
    <>
      <DigitalLinkPanel />
      <NoLoginLinkPanel />
      <DigitalNoLoginLinkPanel />
      <PaperLinkPanel />
    </>
  );
};

export default SelectSubmissionType;
