import attachmentBuilder from '../../components/panels/attachment/Attachment.builder';
import guidanceBuilder from '../../components/panels/guidance/Guidance.builder';
import yourInformationBuilder from '../../components/panels/your-information/YourInformation.builder';

const panelsPalett = {
  title: 'Paneler',
  components: {
    veiledning: guidanceBuilder(),
    dineOpplysninger: yourInformationBuilder(),
    vedleggpanel: attachmentBuilder(),
  },
};

export default panelsPalett;
