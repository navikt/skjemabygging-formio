import HtmlElement from './HtmlElement';

const HtmlElementBuilder = () => {
  const schema = HtmlElement.schema();
  return {
    title: 'HTML element',
    schema: {
      ...schema,
      validateOn: 'blur',
    },
  };
};

export default HtmlElementBuilder;
