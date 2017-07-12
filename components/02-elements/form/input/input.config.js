module.exports = {
  context: {
    attribute: '',
    class: '',
    label: {
      visibility: false,
      attribute: '',
      text: 'Label text',
    },
    field: {
      attribute: '',
      class: '',
      placeholder: 'First and last name'
    }
  },
  variants: [
    {
      name: 'inline',
      context: {
        class: 'input--inline'
      }
    }
  ]
};
