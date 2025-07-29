import areaCodeSelectBuilder from '../../extensions/phone-number/AreaCodeSelect.builder';
import phoneNumberBuilder from '../../extensions/phone-number/PhoneNumber.builder';

const phoneNumberWithAreaCodeSelectBuilder = () => {
  return {
    title: 'Telefonnummer med landskode',
    schema: {
      label: 'Angi landskode og telefonnummer',
      components: [areaCodeSelectBuilder().schema, phoneNumberBuilder().schema],
      type: 'row',
      isPhoneNumberWithAreaCodeSelector: true,
    },
  };
};

export default phoneNumberWithAreaCodeSelectBuilder;
