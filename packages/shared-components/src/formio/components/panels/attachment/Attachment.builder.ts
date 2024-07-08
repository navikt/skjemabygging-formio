import otherAttachmentBuilder from '../../core/attachment/other/OtherAttachment.builder';

const attachmentBuilder = () => {
  return {
    title: 'Vedlegg',
    schema: {
      title: 'Vedlegg',
      type: 'panel',
      key: 'vedlegg',
      input: false,
      theme: 'default',
      isAttachmentPanel: true,
      components: [otherAttachmentBuilder().schema],
    },
  };
};

export default attachmentBuilder;
