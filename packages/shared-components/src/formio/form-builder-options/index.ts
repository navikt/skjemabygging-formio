import menuGroup from '../menu-group';
import { SANITIZE_CONFIG } from './sanitizeConfig';

const FormBuilderOptions = {
  builder: menuGroup,
  language: 'nb-NO',
  sanitizeConfig: SANITIZE_CONFIG,
  editors: {
    ckeditor: {
      settings: {
        heading: {
          options: [
            {
              model: 'paragraph',
              title: 'Paragraf',
            },
            {
              model: 'heading3',
              view: 'h3',
              title: 'Overskrift',
            },
          ],
        },
        link: {
          addTargetToExternalLinks: true,
        },
      },
    },
  },
};

export default FormBuilderOptions;
