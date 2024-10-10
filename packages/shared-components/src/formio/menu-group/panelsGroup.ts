import panelBuilder from '../components/core/panel/Panel.builder';
import attachmentBuilder from '../components/panels/attachment/Attachment.builder';
import guidanceBuilder from '../components/panels/guidance/Guidance.builder';
import yourInformationBuilder from '../components/panels/your-information/YourInformation.builder';

const panelsGroup = {
  title: 'Paneler',
  components: {
    panel: panelBuilder(),
    veiledning: guidanceBuilder(),
    dineOpplysninger: yourInformationBuilder(),
    vedleggpanel: attachmentBuilder(),
  },
};

export default panelsGroup;
