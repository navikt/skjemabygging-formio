import panelBuilder from '../components/core/panel/Panel.builder';
import attachmentBuilder from '../components/panels/attachment/Attachment.builder';
import guidanceBuilder from '../components/panels/guidance/Guidance.builder';

const panelsGroup = {
  title: 'Paneler',
  components: {
    panel: panelBuilder(),
    veiledning: guidanceBuilder(),
    vedleggpanel: attachmentBuilder(),
  },
};

export default panelsGroup;
