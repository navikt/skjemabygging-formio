import { makeStyles } from "@navikt/skjemadigitalisering-shared-components";

const useStyles = makeStyles({
  errorPage: {
    display: "flex",
    flexDirection: "column",
    maxWidth: "50rem",
    margin: "0 auto",
    padding: "1.5rem",
    background: "#fff",
    borderRadius: "0.25rem",
  },
  errorPageHeader: {
    display: "flex",
    alignItems: "center",
  },
  heading: {
    borderRight: "1px solid rgba(0,0,0,.3)",
    marginRight: "1.5rem",
    paddingRight: "1.5rem",
    verticalAlign: "top",
  },
  statusCode: {
    fontSize: "1.25rem",
    fontWeight: 400,
    letterSpacing: "-.001em",
    lineHeight: "1.75rem",
    margin: "0",
  },
  bodyText: {
    fontSize: "1.125rem",
    fontWeight: 400,
    letterSpacing: 0,
    lineHeight: "1.75rem",
    margin: 0,

    "&:not(:last-child)": {
      marginBottom: "1rem",
    },
  },
  link: {
    borderBottom: "1px solid #0067c5",
    textDecoration: "none",
    transition: "border-bottom-color .12s ease-out",
  },
  search: {
    marginTop: "2rem",
  },
  searchHeader: {
    fontSize: "1.75rem",
    letterSpacing: "-.004em",
    lineHeight: "2.25rem",
    fontWeight: 600,
    margin: 0,
    wordBreak: "break-word",
    marginBottom: "0.5rem",
  },
  searchField: {
    webkitAppearance: "none",
    appearance: "none",
    backgroundColor: "#fff",
    border: "1px solid #6a6a6a",
    borderWidth: "2px",
    borderColor: "#0067c5",
    borderRadius: "4px",
    fontSize: "150%",
    padding: "0.5rem",
    paddingRight: "13rem",
    minHeight: "48px",
    width: "100%",
    "&:focus": {
      outline: "none",
      boxShadow: "0 0 0 3px #00347d",
    },
  },
  searchFieldContainer: {
    flexGrow: 1,
  },
  searchButton: {
    alignItems: "center",
    alignSelf: "center",
    background: "none",
    backgroundColor: "#0067c5",
    border: "none",
    borderRadius: "0 4px 4px 0",
    boxShadow: "none",
    color: "#fff",
    cursor: "pointer",
    display: "inline-flex",
    fontSize: "125%",
    gap: "0.5rem",
    gridGap: "0.5rem",
    height: "100%",
    margin: 0,
    minWidth: "48px",
    padding: "0.75rem",
    position: "absolute",
    right: 0,
    textAlign: "center",
    textDecoration: "none",
    textTransform: "none",
    transform: "none",
    webkitTransform: "none",
    "&:focus": {
      boxShadow: "inset 0 0 0 1px #fff, 0 0 0 3px #00347d",
      outline: "none",
    },
  },
  searchForm: {
    display: "flex",
    position: "relative",
  },
});

const PageNotFound = () => {
  const styles = useStyles();
  return (
    <div role="main" className="content-wrapper" id="maincontent" tabIndex="-1">
      <div className={styles.errorPage}>
        <div className={styles.errorPageHeader}>
          <h1 className={styles.heading}>Fant ikke siden</h1>
          <p className={styles.statusCode}>Statuskode 404</p>
        </div>
        <div className="error-page__content">
          <div className="error404">
            <div className="error404__content">
              <p className={styles.bodyText}>
                Beklager, siden kan være slettet eller flyttet, eller det var en feil i lenken som førte deg hit.
              </p>
              <p className={styles.bodyText}>
                Bruk gjerne søket, menyen eller{" "}
                <a href="https://nav.no" className={styles.link}>
                  gå til forsiden
                </a>
                .
              </p>
              <p className={styles.bodyText}>
                <a
                  href="https://www.nav.no/person/kontakt-oss/tilbakemeldinger/feil-og-mangler"
                  className={styles.link}
                >
                  Meld gjerne fra om denne lenken
                </a>
              </p>
            </div>
            <div className={styles.search}>
              <h2 id="search-header" className={styles.searchHeader}>
                Hva leter du etter?
              </h2>
              <form className={styles.searchForm} action="https://www.nav.no/sok" method="GET">
                <div className={styles.searchFieldContainer}>
                  <label htmlFor="search-input" className="sr-only">
                    Hva leter du etter?
                  </label>
                  <input
                    type="text"
                    aria-labelledby="search-header"
                    maxLength="200"
                    placeholder="Søk på nav.no"
                    id="search-input"
                    name="ord"
                    aria-invalid="false"
                    className={styles.searchField}
                  />
                  <div
                    id="textField-error-29a94bad-bcca-486a-8afd-0cf987c72b83"
                    aria-relevant="additions removals"
                    aria-live="polite"
                  />
                </div>
                <div className="search__buttons-container">
                  <button className={styles.searchButton}>
                    <span aria-live="polite">Søk</span>
                  </button>
                </div>
              </form>
            </div>
            <div className="error404__content-en">
              <h2 className="error404__en-header navds-heading navds-heading--large">In English</h2>
              <p className={styles.bodyText}>The page you requested cannot be found.</p>
              <p className={styles.bodyText}>
                Go to the{" "}
                <a href="https://nav.no" className={styles.link}>
                  front page
                </a>
                , or use one of the links in the menu.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageNotFound;
