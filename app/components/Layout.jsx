import {Await} from '@remix-run/react';
import {Suspense} from 'react';
import {Aside, CloseAside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {Header, HeaderMenu} from '~/components/Header';
import {CartMain} from '~/components/Cart';
import {
  PredictiveSearchForm,
  PredictiveSearchResults,
} from '~/components/Search';

export function Layout({cart, children = null, footer, header, isLoggedIn}) {
  return (
    <>
      <CartAside cart={cart} />
      <SearchAside />
      <MobileMenuAside menu={header.menu} />
      <Header header={header} cart={cart} isLoggedIn={isLoggedIn} />
      <main>{children}</main>
{/*       
        <Suspense>     
          <Await resolve={footer}>
            {(footer) => (
            <div className='fixed bottom-0'>
              <Footer menu={footer.menu} />
            </div>
            )}
          </Await>
        </Suspense> */}
      
    </>
  );
}

function CartAside({cart}) {
  return (
    <Aside id="cart-aside" heading="CART">
      <Suspense fallback={<p>Loading cart ...</p>}>
        <Await resolve={cart}>
          {(cart) => {
            return <CartMain cart={cart} layout="aside" />;
          }}
        </Await>
      </Suspense>
    </Aside>
  );
}

function SearchAside() {
  return (
    <Aside id="search-aside" heading="">
      <div className="predictive-search">
        <div className='m-2 ml-6 md:ml-4 text-left'>
          <PredictiveSearchForm>
          {({fetchResults, inputRef}) => (
            <div className='ml-3 mt-3'>
              <input

                className='rounded-lg'
                name="q"
                onChange={fetchResults}
                onFocus={fetchResults}
                placeholder="ej. brazalete color .."
                ref={inputRef}
                type="search"
              />
              &nbsp;
              <button className='p-2 px-3 mx-5 bg-amber-500 text-lime-100 rounded-lg' type="submit">Buscar</button>
            </div>
          )}
          </PredictiveSearchForm>
          <PredictiveSearchResults />
        </div>
      </div>
    </Aside>
  );
}

function MobileMenuAside({menu}) {
  return (
    <Aside id="mobile-menu-aside" heading="MENU">
      <HeaderMenu menu={menu} viewport="mobile" />
    </Aside>
  );
}
