import * as React from "react"
import { Link } from "gatsby"

const Layout = ({ location, title, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`
  const isRootPath = location.pathname === rootPath
  let header

  if (isRootPath) {
    header = (
      <>
        <h1 className="main-heading">
          <Link to="/">{title}</Link>
        </h1>
        <div>
          <div style={{ margin: '10px 0' }}>Software Engineer at <a target="_blank" rel="nofollow noreferrer" href="https://pse.dev/">PSE</a> (Ethereum Foundation)</div>
          <span>
            <strong>Github</strong>: <a target="_blank" rel="nofollow noreferrer" href="https://github.com/saleel">saleel</a>
          </span>
          <span>&nbsp; | &nbsp;</span>
          
          <span>
            <strong>Farcaster</strong>: <a target="_blank" rel="nofollow noreferrer" href="https://warpcast.com/saleel">saleel</a>
          </span>
          <span>&nbsp; | &nbsp;</span>
          
          <span>
            <strong>Twitter</strong>: <a target="_blank" rel="nofollow noreferrer" href="https://twitter.com/_saleel">_saleel</a>
          </span>
          <span>&nbsp; | &nbsp;</span>
          <span>
            <strong>Telegram</strong>: <a target="_blank" rel="nofollow noreferrer" href="https://tttttt.me/saleelp">saleelp</a>
          </span>
        </div>
        <hr />
      </>
    )
  } else {
    header = (
      <Link className="header-link-home" to="/">
        Home
      </Link>
    )
  }

  return (
    <div className="global-wrapper" data-is-root-path={isRootPath}>
      <header className="global-header">{header}</header>
      <main>{children}</main>
      {/* <footer>
        © {new Date().getFullYear()}, Saleel
      </footer> */}
    </div>
  )
}

export default Layout
