import {Suspense} from 'react';
import React, { useRef, useState } from 'react';
import {defer, redirect} from '@shopify/remix-oxygen';
import {Await, Link, useLoaderData} from '@remix-run/react';
import { Image,VariantSelector,getSelectedProductOptions, CartForm, Pagination} from '@shopify/hydrogen';
import {getVariantUrl} from '~/utils';
import { CustomMoney, CustomMoneyVariant } from '~/components/Utils/MoneyWithComparePrice';
import { VARIANTS_QUERY, PRODUCT_QUERY, RELATED_PRODUCTS_QUERY} from '../graphql/queries/getProductAndVariations'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination as PaginationSwipper,Scrollbar, A11y } from 'swiper/modules';
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

export const meta = ({data}) => {
  return [{title: `Hydrogen | ${data.product.title}`}];
};

export async function loader({params, request, context}) {
  const {handle} = params;
  const {storefront} = context;

  const selectedOptions = getSelectedProductOptions(request).filter(
    (option) =>
      // Filter out Shopify predictive search query params
      !option.name.startsWith('_sid') &&
      !option.name.startsWith('_pos') &&
      !option.name.startsWith('_psq') &&
      !option.name.startsWith('_ss') &&
      !option.name.startsWith('_v') &&
      // Filter out third party tracking params
      !option.name.startsWith('fbclid'),
  );

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  // await the query for the critical product data
  const {product} = await storefront.query(PRODUCT_QUERY, {
    variables: {handle, selectedOptions},
  });

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  const firstVariant = product.variants.nodes[0];
  const firstVariantIsDefault = Boolean(
    firstVariant.selectedOptions.find(
      (option) => option.name === 'Title' && option.value === 'Default Title',
    ),
  );
  if (firstVariantIsDefault) {
    product.selectedVariant = firstVariant;
  } else {
    // if no selected variant was returned from the selected options,
    // we redirect to the first variant's url with it's selected options applied
    if (!product.selectedVariant) {
      return redirectToFirstVariant({product, request});
    }
  }

  // In order to show which variants are available in the UI, we need to query
  // all of them. But there might be a *lot*, so instead separate the variants
  // into it's own separate query that is deferred. So there's a brief moment
  // where variant options might show as available when they're not, but after
  // this deffered query resolves, the UI will update.
  const variants = storefront.query(VARIANTS_QUERY, {
    variables: {handle},
  });

  const recommendedProducts = await storefront.query(RELATED_PRODUCTS_QUERY, {
    variables: {
      productId: product.id,
      intent: "RELATED"
    }
  })

  return defer({product, variants, recommendedProducts});
}

function redirectToFirstVariant({product, request}) {
  const url = new URL(request.url);
  const firstVariant = product.variants.nodes[0];

  throw redirect(
    getVariantUrl({
      pathname: url.pathname,
      handle: product.handle,
      selectedOptions: firstVariant.selectedOptions,
      searchParams: new URLSearchParams(url.search),
    }),
    {
      status: 302,
    },
  );
}

export default function Product() {
  const {product, variants, recommendedProducts} = useLoaderData();
  const {selectedVariant} = product;
  return (
    <div className="justify-center mx-10 md:m-10">
      <div className='md:m-2 grid grid-cols-1 md:grid-cols-2 gap-x-14'>
        <div>
          <button class="custom_next">Custom Next Btn</button>
          <button class="custom_prev">Custom Next Btn</button>
          <Swiper
            modules={[Navigation, PaginationSwipper, A11y]}
            slidesPerView={1}
            navigation={{
              nextEl: ".custom_next",
              prevEl: ".custom_prev"
            }}
            pagination={{ clickable: true }}
            className='flex overflow-hidden z-0 w-9/12 md:w-7/12 m-auto'
          >
            { product.images.nodes.map((image)=>(
              <SwiperSlide key={image.id} className='justify-center items-center '>
                <ProductImage image={image}/>
              </SwiperSlide>))
            }
          </Swiper>
        </div>
        
        <ProductMain
        selectedVariant={selectedVariant}
        product={product}
        variants={variants}
      />
        <div className='my-10'>
          <ProductDescription product={product}/>
          <div className='my-10'>
            <strong className='text-xl mb-10 uppercase'>Productos relacionados</strong>
          </div>
            <div className='grid grid-cols-2 gap-5'>
              <RecommendedProducts  products={recommendedProducts}></RecommendedProducts>
          </div>
        </div>

      </div>
    </div>
  );
}

function ProductImage({image}) {
  if (!image) {
    return <div className="product-image" />;
  }
  return (
    <Image
    alt={image.altText || 'Product Image'}
    aspectRatio="1/1"
    data={image}
    key={image.id}
    sizes="(min-width: 15em) 100vw, 100vw"
  />
  );
}

function RecommendedProducts ({products}){
  return products.productRecommendations.map((product) => (
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

function ProductDescription({product}){
  const {descriptionHtml} = product;
  return(
    <div>      
      <p>
        <strong className='text-xl'>DESCRIPCIÓN</strong>
      </p>
      <br />
      <div dangerouslySetInnerHTML={{__html: descriptionHtml}} />
      <br />
    </div>
  )
}

function ProductMain({selectedVariant, product, variants}) {
  const {title} = product;
  return (
    <div className="md:sticky md:top-10 self-start">
      <h1 className='my-0 md:my-2'>{title}</h1>
      <ProductPrice selectedVariant={selectedVariant} />
      <Suspense
        fallback={
          <ProductForm
            product={product}
            selectedVariant={selectedVariant}
            variants={[]}
          />
        }
      >
        <Await
          errorElement="There was a problem loading product variants"
          resolve={variants}
        >
          {(data) => (
            <ProductForm
              product={product}
              selectedVariant={selectedVariant}
              variants={data.product?.variants.nodes || []}
            />
          )}
        </Await>
      </Suspense>
    </div>
  );
}

function ProductPrice({selectedVariant}) {
  return (
    <div className="product-price">
      {selectedVariant?.compareAtPrice && selectedVariant?.price &&  Number.parseInt(selectedVariant?.compareAtPrice.amount) > Number.parseInt(selectedVariant?.price.amount) ? (
        <>
          <strong className='text-xl text-red-600'>¡Producto en Descuento!</strong>
          <br />
          <CustomMoneyVariant product={selectedVariant} withoutCurrency={false}></CustomMoneyVariant>
        </>
      ) : (
        selectedVariant?.price && <CustomMoney product={selectedVariant} />
      )}
    </div>
  );
}

function ProductForm({product, selectedVariant, variants}) {
  return (
    <div className="product-form">
      <VariantSelector
        handle={product.handle}
        options={product.options}
        variants={variants}
      >
        {({option}) => <ProductOptions key={option.name} option={option} />}
      </VariantSelector>
      <br />
      <AddToCartButton
        disabled={!selectedVariant || !selectedVariant.availableForSale}
        onClick={() => {
          window.location.href = window.location.href + '#cart-aside';
        }}
        lines={
          selectedVariant
            ? [
                {
                  merchandiseId: selectedVariant.id,
                  quantity: 1,
                },
              ]
            : []
        }
      >
        {selectedVariant?.availableForSale ? 'Add to cart' : 'Sold out'}
      </AddToCartButton>
    </div>
  );
}

function ProductOptions({option}) {
  return (
    <div className="product-options" key={option.name}>
      <h5>{option.name}</h5>
      <div className="product-options-grid">
        {option.values.map(({value, isAvailable, isActive, to}) => {
          return (
            <Link
              className="product-options-item"
              key={option.name + value}
              prefetch="intent"
              preventScrollReset
              replace
              to={to}
              style={{
                border: isActive ? '1px solid black' : '1px solid transparent',
                opacity: isAvailable ? 1 : 0.3,
              }}
            >
              {value}
            </Link>
          );
        })}
      </div>
      <br />
    </div>
  );
}

function AddToCartButton({analytics, children, disabled, lines, onClick}) {
  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher) => (
        <>
          <input
            name="analytics"
            type="hidden"
            value={JSON.stringify(analytics)}
          />
          <button
            type="submit"
            onClick={onClick}
            disabled={disabled ?? fetcher.state !== 'idle'}
          >
            {children}
          </button>
        </>
      )}
    </CartForm>
  );
}

