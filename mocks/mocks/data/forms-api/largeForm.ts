import { checkbox, number, panel, textArea, textField } from '../../form-builder/components';
import form from '../../form-builder/form/form';
import formProperties from '../../form-builder/form/formProperties';

const largeForm = () => {
  const formNumber = 'largeform';
  return form({
    title: 'Large form',
    formNumber: formNumber,
    path: formNumber,
    components: [...Array(100)].map((_, i) =>
      panel({
        title: `p ${i + 1}`,
        components: [
          checkbox({ label: `Avkryssingsboks ${i + 1}`, key: `avkryssingsboks${i}` }),
          textField({ label: `Tekstfelt ${i + 1}a` }),
          textField({ label: `Tekstfelt ${i + 1}b`, customConditional: `show = row.avkryssingsboks${i} === true` }),
          textField({ label: `Tekstfelt ${i + 1}c`, customConditional: `show = row.avkryssingsboks${i} === true` }),
          textField({ label: `Tekstfelt ${i + 1}d`, customConditional: `show = row.avkryssingsboks${i} === true` }),
          textField({ label: `Tekstfelt ${i + 1}e`, customConditional: `show = row.avkryssingsboks${i} === true` }),
          textField({ label: `Tekstfelt ${i + 1}f`, customConditional: `show = row.avkryssingsboks${i} === true` }),
          textField({ label: `Tekstfelt ${i + 1}g`, customConditional: `show = row.avkryssingsboks${i} === true` }),
          textField({ label: `Tekstfelt ${i + 1}h`, customConditional: `show = row.avkryssingsboks${i} === true` }),
          textArea({ label: `Tekstområde ${i + 1}` }),
          number({ label: `Tall ${i + 1}` }),
        ],
      }),
    ),
    properties: formProperties({ formNumber }),
  });
};

export default largeForm;
