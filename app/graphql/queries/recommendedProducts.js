export const RECOMMENDED_PRODUCTS_QUERY = `#graphql
fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 1) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
  }
  query RecommendedProducts (
    $country: CountryCode, 
    $language: LanguageCode,
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  )
    @inContext(country: $country, language: $language) {
    products(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor,
      sortKey: UPDATED_AT, 
      reverse: true) {
      nodes {
        ...RecommendedProduct
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        endCursor
        startCursor
      }
    }
  }
`;