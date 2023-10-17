import { defer, json} from '@shopify/remix-oxygen';
import { Image, Money } from '@shopify/hydrogen';
import { FEATURED_COLLECTION_QUERY } from '../graphql/queries/featuredCollection'
import { getPaginationVariables } from '@shopify/hydrogen';
import { Pagination } from "@shopify/hydrogen";
import { useEffect } from "react";
import { useLoaderData, useNavigate, Link } from "@remix-run/react";
import { useInView } from "react-intersection-observer";
import { RECOMMENDED_PRODUCTS_QUERY } from '../graphql/queries/recommendedProducts'


export const meta = () => {
  return [{title: 'Hydrogen | Home'}];
};


export async function loader({context, request}) {
    const {storefront} = context;
    const pagiantion = getPaginationVariables(request, {
      pageBy: 8,
    });
    const products  = await storefront.query(RECOMMENDED_PRODUCTS_QUERY, { variables: pagiantion});
    return json({products});
  }
// export async function loader({context, request}) {
//   const {storefront} = context;
//   const variables = getPaginationVariables(request, {
//     pageBy: 8,
//   });
//   debugger;
//   const { collections }  = await storefront.query(FEATURED_COLLECTION_QUERY);
//   const featuredCollection = collections.nodes[0];
//   const { productConnection }  = await storefront.query(RECOMMENDED_PRODUCTS_QUERY, {variables: { ...variables }});
//     debugger;  
//   return defer({featuredCollection, productConnection});
// }

export default function Homepage() {
  return (
    <div className="home">  
      {/* <FeaturedCollection collection={data.featuredCollection} /> */}
      <RecommendedProducts/>
    </div>
  );
}


  

export function RecommendedProducts ( ) {
    const { ref, inView, entry } = useInView();
    const { products } = useLoaderData();
    console.log(products)
    return (
      <div className='recommended-products'>
        <div className="recommended-products-grid">
          <Pagination connection={products.products}>
            {({ nodes, NextLink, hasNextPage, nextPageUrl, state }) => { 
              console.log(nodes)
              return(
              <>
                <ProductsLoadedOnScroll
                  nodes={nodes}
                  inView={inView}
                  hasNextPage={hasNextPage}
                  nextPageUrl={nextPageUrl}
                  state={state}
                />
                <NextLink ref={ref}>Load more</NextLink>
              </>
            )}}
          </Pagination>
        </div>
      </div>
    );
  }

 function ProductsLoadedOnScroll({ nodes, inView, hasNextPage, nextPageUrl, state }) {
    const navigate = useNavigate();
  
    useEffect(() => {
      if (inView && hasNextPage) {
        navigate(nextPageUrl, {
          replace: true,
          preventScrollReset: true,
          state,
        });
      }
    }, [inView, navigate, state, nextPageUrl, hasNextPage]);
  
    return nodes.map((product) => (
      <Link
        key={product.id}
        className="recommended-product"
        to={`/products/${product.handle}`}
      >
        <Image
          data={product.images.nodes[0]}
          aspectRatio="1/1"
          sizes="(min-width: 45em) 20vw, 50vw"
        />
        <h4>{product.title}</h4>
        <small>
          <Money data={product.priceRange.minVariantPrice} />
        </small>
      </Link>
    ));
  }

function FeaturedCollection({collection}) {
  if (!collection) return null;
  const image = collection?.image;
  return (
    <Link
      className="featured-collection"
      to={`/collections/${collection.handle}`}
    >
      {image && (
        <div className="featured-collection-image">
          <Image data={image} sizes="100vw" />
        </div>
      )}
      <h1>{collection.title}</h1>
    </Link>
  );
}

