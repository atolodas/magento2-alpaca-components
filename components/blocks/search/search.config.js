module.exports = {
  title: 'Search',
  context: {
    placeholder: 'Search...',
    buttonText: 'Search'
  },
  variants: [
    {
      name: 'autocomplete',
      context: {
        autocomplete: {
          headertitleValue: 'Product you\'re looking for',
          button: {
            text: 'See all products',
            modifier: 'light',
            modifier2: 'search',
            iconId: 'arrow-right',
            iconClass: 'button__icon'
          },
          productstitle: 'Products',
          categoriestitle: 'Categories',
          productqty: '320 results',
          categoriesqty: '60 results'
        }
      }
    }
  ]
}
