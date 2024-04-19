import defaultAttachmentBuilder from '../components/core/attachment/default/DefaultAttachment.builder';
import otherAttachmentBuilder from '../components/core/attachment/other/OtherAttachment.builder';

const attachmentGroup = {
  title: 'Vedlegg',
  default: false,
  components: {
    attachment: defaultAttachmentBuilder(),
    otherAttachment: otherAttachmentBuilder(),
  },
};

export default attachmentGroup;
