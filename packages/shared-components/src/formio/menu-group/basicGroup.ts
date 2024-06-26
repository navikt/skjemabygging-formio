import accordionBuilder from '../components/core/accordion/Accordion.builder';
import alertBuilder from '../components/core/alert/Alert.builder';
import checkboxBuilder from '../components/core/checkbox/Checkbox.builder';
import htmlElementBuilder from '../components/core/html-element/HtmlElement.builder';
import imageBuilder from '../components/core/image/Image.builder';
import radioBuilder from '../components/core/radio/Radio.builder';
import selectBoxesBuilder from '../components/core/select-boxes/SelectBoxes.builder';
import selectBuilder from '../components/core/select/Select.builder';
import textAreaBuilder from '../components/core/textarea/TextArea.builder';
import textFieldBuilder from '../components/core/textfield/TextField.builder';
import numberBuilder from '../components/extensions/number/Number.builder';

const basicGroup = {
  title: 'Standard felter',
  default: false,
  components: {
    textField: textFieldBuilder(),
    textArea: textAreaBuilder(),
    number: numberBuilder(),
    checkbox: checkboxBuilder(),
    selectBoxes: selectBoxesBuilder(),
    select: selectBuilder(),
    radio: radioBuilder(),
    image: imageBuilder(),
    alertstripe: alertBuilder(),
    htmlElement: htmlElementBuilder(),
    accordion: accordionBuilder(),
  },
};

export default basicGroup;
