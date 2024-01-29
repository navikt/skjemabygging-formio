import HtmlElement from './HtmlElement';

const HtmlElementBuilder = () => {
  const schema = HtmlElement.schema();
  return {
    title: 'Tekstblokk',
    schema: {
      ...schema,
      validateOn: 'blur',
    },
  };
};

export default HtmlElementBuilder;
