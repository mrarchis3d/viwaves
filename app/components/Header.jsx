import {Await, NavLink, useMatches} from '@remix-run/react';
import {Image} from '@shopify/hydrogen';
import {Suspense, useState} from 'react';
import { BiSearch, BiUser } from 'react-icons/bi';
import { AiOutlineShoppingCart } from 'react-icons/ai';

export function Header({header, isLoggedIn, cart}) {
  const {shop, menu} = header;
  return (
    <header className="z-10 w-full sticky top-0 px-4 align-middle h-16 bg-gradient-to-r from-lime-400 to-green-500 flex drop-shadow-md content-center">
      <div className='sm:w-40 w-20 my-auto origin-center'>
        <NavLink prefetch="intent" to="/" style={activeLinkStyle} end>
        {shop.brand.logo ?
            <Image
              alt={shop.name}
              width={140}
              data={shop.brand.logo.image}
              loading="lazy"
            />
        : <strong>{shop.name}</strong>}
        </NavLink>
      </div>
      <div className='my-auto'>
        <HeaderMenu menu={menu} viewport="desktop" />
      </div>
      <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
    </header>
  );
}

export function HeaderMenu({menu, viewport}) {
  const [root] = useMatches();
  const publicStoreDomain = root?.data?.publicStoreDomain;
  const className = `header-menu-${viewport}`;

  function closeAside(event) {
    if (viewport === 'mobile') {
      event.preventDefault();
      window.location.href = event.currentTarget.href;
    }
  }

  return (
    <nav className={className} role="navigation">
      {viewport === 'mobile' && (
        <NavLink
          end
          onClick={closeAside}
          prefetch="intent"
          style={activeLinkStyle}
          to="/"
        >
          Home
        </NavLink>
      )}
      {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
        if (!item.url) return null;

        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain)
            ? new URL(item.url).pathname
            : item.url;
        return (
          <NavLink
            end
            key={item.id}
            onClick={closeAside}
            prefetch="intent"
            style={activeLinkStyle}
            to={url}
          >
            <text className='text-lg font-sans text-lime-800 hover:text-lime-100 no-underline'>{item.title}</text>
          </NavLink>
        );
      })}
    </nav>
  );
}

function HeaderCtas({isLoggedIn, cart}) {
  return (
    <nav className="flex items-center ml-auto space-x-2" role="navigation">
      <HeaderMenuMobileToggle />
      <NavLink prefetch="intent" to="/account" style={activeLinkStyle}>
        <text className='font-sans
        inline
        text-lime-800 
        hover:text-lime-100 
        no-underline 
        text-sm
        sm:text-lg '> 
        <BiUser className='inline my-1'/>{isLoggedIn ? 'Mi cuenta' : 'Ingresa'}</text>
      </NavLink>
      <SearchToggle />
      <CartToggle cart={cart} />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  return (
    <a className="text-lg font-sans text-lime-800 header-menu-mobile-toggle m-auto" href="#mobile-menu-aside">
      <h3>☰</h3>
    </a>
  );
}

function SearchToggle() {
  const [assideOpen, setAsside] = useState(false);

  return <a className='
  p-1
  inline
  hover:no-underline 
  text-sm
  sm:text-lg 
  font-sans 
  text-lime-800 
  hover:text-lime-100' href="#search-aside"> <BiSearch className='inline my-1'/>Buscar</a>;
}

function CartBadge({count}) {
  return <a className='
  p-1
  inline
  hover:no-underline 
  text-lg
  sm:text-xl 
  font-sans 
text-lime-800 
hover:text-lime-100 ' href="#cart-aside">
  <AiOutlineShoppingCart className='inline my-1'/> 
  <div className='bg-amber-500 rounded-full inline w-1 m-1 p-1 h-0 relative justify-center items-center text-center' >
    <text className='
    text-sm
    sm:text-lg  text-lime-100'>{count}</text>
  </div>
  </a>;
}

function CartToggle({cart}) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        {(cart) => {
          if (!cart) return <CartBadge count={0} />;
          return <CartBadge count={cart.totalQuantity || 0} />;
        }}
      </Await>
    </Suspense>
  );
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};

function activeLinkStyle({isActive, isPending}) {
  return {
    textDecoration: 'none',
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'black',
  };
}
