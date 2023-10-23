import { json} from '@shopify/remix-oxygen';
import { Image, Money } from '@shopify/hydrogen';
import { FEATURED_COLLECTION_QUERY } from '../graphql/queries/featuredCollection'
import { getPaginationVariables } from '@shopify/hydrogen';
import { Pagination } from "@shopify/hydrogen";
import { useEffect, useState } from "react";
import { useLoaderData, useNavigate, Link } from "@remix-run/react";
import { useInView } from "react-intersection-observer";
import { RECOMMENDED_PRODUCTS_QUERY } from '../graphql/queries/recommendedProducts'
import { motion } from "framer-motion"


export const meta = () => {
  return [{title: 'Hydrogen | Home'}];
};


export async function loader({context, request}) {
    const {storefront} = context;
    const pagination = getPaginationVariables(request, {
      pageBy: 8,
    });
    const { collections }  = await storefront.query(FEATURED_COLLECTION_QUERY);
    const featuredCollection = collections.nodes;
    const products  = await storefront.query(RECOMMENDED_PRODUCTS_QUERY, { variables: pagination});
    return json({products, featuredCollection});
  }

export default function Homepage() {
  return (
    <div className="home">  
      <div className="mt-12 mb-12 flex flex-col md:flex-row justify-center items-center gap-2">
        <FeaturedCollection/>
      </div>

      <RecommendedProducts/>
    </div>
  );
}
  

export function RecommendedProducts ( ) {
    const { ref, inView, entry } = useInView();
    const { products } = useLoaderData();
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

function FeaturedCollection() {
  const { featuredCollection } = useLoaderData();
  const [expandedIndex, setExpandedIndex] = useState(null)
  const handleCardClick = (index) => {
    setExpandedIndex(index === expandedIndex ? -1 : index)
  }
  const cardVariants = {
    expanded: {
      width: "400px"
    },
    collapsed: {
      width: '200px'
    }
  }
  console.log(featuredCollection)
  if (!featuredCollection) return null;
  return (
    featuredCollection.map((collection, index) =>{
      return (
      <motion.div
            key={index}
            className={`card cursor-pointer h-[300px] bg-cover bg-center rounded-[10px] ${index === expandedIndex ? 'expanded': ''}`}
            variants={cardVariants}
            initial="collapsed"
            animate={index === expandedIndex ? 'expanded': 'collapsed'}
            transition={{duration: 0.5}}
            onHoverStart={() => handleCardClick(index)}
            style={{
              backgroundImage: `url(${collection.image.url})`,
            }}
          >

              <div className='card-content h-full flex flex-col justify-end'>
                  <div className='card-footer rounded-[10px] bg-gray-800 bg-opacity-75 min-h-[30px] flex flex-col items-center justify-center'>
                  <Link to={`/collections/${collection.handle}`} className='text-gray-300 text-center'>{collection.title} </Link>
                  </div>
              </div>
          </motion.div>)
    })
  );
}


                  /* <Link
      className={`card cursor-pointer h-[500px] bg-cover bg-center rounded-[20px] ${index === expandedIndex ? 'expanded': ''}`}
              to={`/collections/${collection.handle}`}
            >
              {collection?.image && (
                <div className="w-full aspect-video">
                  <Image data={collection?.image} />
                </div>
              )}
              <text>{collection.title}</text>
            </Link> */