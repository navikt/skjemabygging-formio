import yourInformationBuilder from '../../groups/your-information/YourInformation.builder';

const yourInformationPanelBuilder = () => {
  return {
    title: 'Dine opplysninger',
    schema: {
      title: 'Dine opplysninger',
      type: 'panel',
      key: 'dineOpplysninger',
      input: false,
      theme: 'default',
      components: [yourInformationBuilder().schema],
    },
  };
};

export default yourInformationPanelBuilder;
