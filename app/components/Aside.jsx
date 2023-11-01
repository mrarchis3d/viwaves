import { IoExitOutline } from 'react-icons/io5';
/**
 * A side bar component with Overlay that works without JavaScript.
 * @example
 * ```jsx
 * <Aside id="search-aside" heading="SEARCH">
 *  <input type="search" />
 *  ...
 * </Aside>
 * ```
 */
export function Aside({children, heading, id = 'aside'}) {
  return (
    <div aria-modal className="overlay" id={id} role="dialog">
      <button
        className="close-outside"
        onClick={() => {
          history.go(-1);
          window.location.hash = '';
        }}
      />
      <aside>
        <header>
          <h3>{heading}</h3>
          <CloseAside />
        </header>
        <main>{children}</main>
      </aside>
    </div>
  );
}

export function CloseAside() {
  return (
    /* eslint-disable-next-line jsx-a11y/anchor-is-valid */
    <a className="inline hover:no-underline group" href="#" onChange={() => history.go(-1)}>
      <text className='text-sm mx-2 inline text-lime-900 group-hover:text-amber-700'> <IoExitOutline className='inline mx-2'/>Volver</text>
    </a>
  );
}
