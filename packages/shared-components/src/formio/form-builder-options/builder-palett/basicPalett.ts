import buttonBuilder from '../../components/core/button/Button.builder';
import checkboxBuilder from '../../components/core/checkbox/Checkbox.builder';
import imageBuilder from '../../components/core/image/Image.builder';
import radioBuilder from '../../components/core/radio/Radio.builder';
import selectBoxesBuilder from '../../components/core/select-boxes/SelectBoxes.builder';
import selectBuilder from '../../components/core/select/Select.builder';
import textAreaBuilder from '../../components/core/textarea/TextArea.builder';
import textFieldBuilder from '../../components/core/textfield/TextField.builder';
import numberBuilder from '../../components/extensions/number/Number.builder';
import percentBuilder from '../../components/extensions/percent/Percent.builder';
import attachmentBuilder from '../../components/groups/attachment/Attachment.builder';

const basicPalett = {
  title: 'Standard felter',
  default: false,
  components: {
    checkbox: null,
    radio: null,
    textArea: null,
    textfield: textFieldBuilder(),
    textarea: textAreaBuilder(),
    number: numberBuilder(),
    prosent: percentBuilder(),
    navCheckbox: checkboxBuilder(),
    selectboxes: selectBoxesBuilder(),
    navSelect: selectBuilder(),
    radiopanel: radioBuilder(),
    vedlegg: attachmentBuilder(),
    survey: {
      ignore: true,
    },
    image: imageBuilder(),
    password: {
      ignore: true,
    },
    button: buttonBuilder(),
  },
};

export default basicPalett;
