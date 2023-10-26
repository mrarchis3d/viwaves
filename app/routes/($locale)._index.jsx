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
      <h2 className='text-lime-900 text-xl my-8 font-semibold text-center'>NUESTROS PRODUCTOS</h2>
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
    console.log(nodes)
    return nodes.map((product) => (
      <Link
        key={product.id}
        className="recommended-product hover:no-underline group"
        to={`/products/${product.handle}`}
      >
        <Image
          data={product.images.nodes[0]}
          aspectRatio="1/1"
          sizes="(min-width: 45em) 20vw, 50vw"
        />
        <h4 className='text-sm text-lime-950 m-0 mt-1 font-semibold leading-5 group-hover:text-lime-800 text-ellipsis overflow-hidden'>{product.title}</h4>
        <CustomMoney product={product} withoutCurrency={false} />
      </Link>
    ));
  }

  const CustomMoney = ({product, withoutCurrency = true}) => {
    return (
      <div>
        <text className='text-lg m-0 text-lime-950 font-semibold slashed-zero proportional-nums group-hover:text-lime-700'>
          <text className='text-xs m-0 relative top-0 right-0 h-16 w-16'>$</text>
          <Money className='inline' data={product.priceRange.minVariantPrice} withoutCurrency={true}/>
          {(withoutCurrency==false)?<small className='text-xs mx-1'>{product.priceRange.minVariantPrice.currencyCode}</small>:<></>}
        </text>
        { 
        product.compareAtPriceRange!==undefined && product.compareAtPriceRange.maxVariantPrice!== undefined && product.compareAtPriceRange.maxVariantPrice.amount !== "0.0"?
            <text className='text-red-700 line-through group-hover:text-red-500 text-xs m-0 relative top-0 right-0 h-16 w-16'>${product.compareAtPriceRange.maxVariantPrice.amount}</text>
        :<></>
        }
      </div>
    )
  };

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
      width: '300px'
    }
  }
  if (!featuredCollection) return null;
  return (
    featuredCollection.map((collection, index) =>{
      return (
      <motion.div
            key={index}
            className={`card cursor-pointer h-[200px] bg-cover bg-center rounded-[10px] ${index === expandedIndex ? 'expanded': ''}`}
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
