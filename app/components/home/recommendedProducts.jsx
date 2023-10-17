import { Pagination } from "@shopify/hydrogen";
import { useEffect } from "react";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useInView } from "react-intersection-observer";
import { RECOMMENDED_PRODUCTS_QUERY } from '../../graphql/queries/recommendedProducts'


export async function loader({context, request}) {
  try{
    const {storefront} = context;
    const variables = getPaginationVariables(request, {
      pageBy: 8,
    });
    const products  = await storefront.query(RECOMMENDED_PRODUCTS_QUERY);
    console.log(products);
    return json({products});
  }catch(error){
    console.error(error)
  }

  }
  

export function RecommendedProducts ( ) {
    const { ref, inView, entry } = useInView();
    const { products } = useLoaderData();
    return (
      <Pagination connection={products}>
        {({ nodes, NextLink, hasNextPage, nextPageUrl, state }) => (
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
        )}
      </Pagination>
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
      <Link key={product.id} to={product.id}>
        {product.title}
      </Link>
    ));
  }