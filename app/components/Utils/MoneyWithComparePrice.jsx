import { Money } from '@shopify/hydrogen';

const CustomMoney = ({product, withoutCurrency = true}) => {
    return (
      <div>
        <text className='text-lg m-0 text-lime-950 font-semibold slashed-zero proportional-nums group-hover:text-lime-700'>
          <text className='text-xs m-0 relative top-0 right-0 h-16 w-16'>$</text>
          <Money className='inline' data={product.priceRange?.minVariantPrice} withoutCurrency={true}/>
          {(withoutCurrency==false)?<small className='text-xs mx-1'>{product.priceRange.minVariantPrice.currencyCode}</small>:<></>}
        </text>
        { 
        product.compareAtPriceRange!==undefined && 
        product.compareAtPriceRange?.maxVariantPrice!== undefined && 
        product.compareAtPriceRange?.maxVariantPrice?.amount !== undefined && 
        product.compareAtPriceRange?.maxVariantPrice?.amount !== "0.0"?
            <text className='text-red-700 line-through group-hover:text-red-500 text-xs m-0 relative top-0 right-0 h-16 w-16'>${product.compareAtPriceRange?.maxVariantPrice?.amount}</text>
        :<></>
        }
      </div>
    )
  };


  export {CustomMoney}