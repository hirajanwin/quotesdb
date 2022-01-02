export default {
  github: 'http://github.com',
  docsRepositoryBase: null, // base URL for the docs repository
  titleSuffix: ' - QuotesDB',
  nextLinks: true,
  prevLinks: true,
  search: false,
  customSearch: null, // customizable, you can use algolia for example
  darkMode: true,
  footer: true,
  floatTOC: false,
  footerText: (
    <p>
      Made in 🇮🇳 with ❤️ by{' '}
      <a href="https://solvencino.vercel.app">Solvencino</a>
    </p>
  ),
  footerEditLink: null,
  logo: (
    <>
      <span className="mr-2 font-extrabold hidden md:inline">QuotesDB</span>
    </>
  ),
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content="Nextra: the next docs builder" />
      <meta name="og:title" content="Nextra: the next docs builder" />
    </>
  ),
}
