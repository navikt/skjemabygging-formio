import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormImage = (): Component => {
  return {
    type: 'file',
    fileMaxSize: '1MB',
    label: 'Last opp fil',
    key: 'image',
    storage: 'base64',
    image: true,
    filePattern: '.png, .jpg, .jpeg',
    webcam: false,
    multiple: false,
    validate: {
      required: true,
    },
  };
};

export default editFormImage;
