const submissionDoNotShowConditionalInput = {
  data: {
    inputCondition: "doNotShowImg",
  },
};

const submissionEmptyInput = {
  data: {
    inputCondition: "",
  },
};

const submissionOtherInput = {
  data: {
    inputCondition: "",
  },
};

const imgForm = {
  title: "Veiledning",
  collapsible: false,
  key: "veiledning",
  type: "panel",
  label: "Veiledning",
  buttonSettings: {
    previous: true,
    cancel: true,
    next: true,
  },
  breadcrumbClickable: true,
  navigateOnEnter: false,
  saveOnEnter: false,
  scrollToTop: false,
  input: false,
  components: [
    {
      label: "Input Condition",
      type: "textfield",
      key: "inputCondition",
      fieldSize: "input--xxl",
      input: true,
      dataGridLabel: true,
      validateOn: "blur",
      validate: {
        required: true,
      },
      tableView: true,
    },
    {
      image: [
        {
          storage: "base64",
          name: "testImage.jpeg",
          url: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEBLAEsAAD",
          size: 12416,
          type: "image/jpeg",
          originalName: "testImage.jpeg",
        },
      ],
      altText: "img alt text",
      description: "img description",
      showInPdf: true,
      widthPercent: 100,
      key: "image1",
      conditional: {
        show: false,
        when: "inputCondition",
        eq: "doNotShowImg",
      },
      type: "image",
      label: "Bilde",
      input: false,
      tableView: false,
    },
  ],
  tableView: false,
};

const imgFormAndSubmission = {
  submissionDoNotShowConditionalInput,
  submissionEmptyInput,
  submissionOtherInput,
  imgForm,
};

export default imgFormAndSubmission;
