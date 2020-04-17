import React from "react";
import "./App.css";
import "react-dates/lib/css/_datepicker.css";
import algoliasearch from "algoliasearch/lite";

import {
  connectHighlight,
  InstantSearch,
  SearchBox,
  SortBy,
  connectInfiniteHits,
  HitsPerPage,
  Stats,
  RefinementList,
  connectNumericMenu,
} from "react-instantsearch-dom";

import qs from "qs";

const DEBOUNCE_TIME = 700;
const searchClient = algoliasearch(
  "OGA3DLNEMM",
  "b760cace5be0c729b0cad075242cfaf6"
);

const InfiniteHits = ({ hits, hasMore, refineNext }) => (
  <div className="content">
    <ol>
      {hits.map((hit) => (
        <li key={hit.objectID}>
          <div className="hits">
            <h4>
              {" "}
              <strong>
                <a href={hit.url}>
                  <CustomHighlight hit={hit} attribute="title" />
                </a>
              </strong>
            </h4>
            <hr />
            <div className="lower">
              <h5>Source: {hit.source}</h5>
              <div className="date">
                - Parution:
                {Intl.DateTimeFormat("en-US").format(
                  Math.floor(new Date(hit.online * 1000))
                )}
              </div>
            </div>

            <hr />
            <div className="text">
              <CustomHighlight hit={hit} attribute="document_text" />
              <a href={hit.url}>"...Lire la suite..."</a>
            </div>
          </div>
        </li>
      ))}
    </ol>
    <div className="button3">
      <button
        className="btn btn-success"
        disabled={!hasMore}
        onClick={refineNext}
        style={!hasMore ? { display: "none" } : null}
      >
        Show more
      </button>
    </div>
  </div>
);

const CustomInfiniteHits = connectInfiniteHits(InfiniteHits);

const NumericMenu = ({ items, refine, createURL }) => (
  <form>
    <ul>
      {items.map((item) => (
        <li key={item.value}>
          <input
            type="radio"
            name="filter"
            onClick={(event) => {
              refine(item.value);
            }}
          />
          {item.label}
        </li>
      ))}
    </ul>
  </form>
);
const CustomNumericMenu = connectNumericMenu(NumericMenu);

const Highlight = ({ highlight, attribute, hit }) => {
  const parsedHit = highlight({
    highlightProperty: "_highlightResult",
    attribute,
    hit,
  });

  return (
    <span>
      {parsedHit.map((part, index) =>
        part.isHighlighted ? (
          <mark key={index}>{part.value}</mark>
        ) : (
          <span key={index}>{part.value}</span>
        )
      )}
    </span>
  );
};

const CustomHighlight = connectHighlight(Highlight);

const createURL = (state) => `?${qs.stringify(state)}`;
const urlToSearchState = (location) => qs.parse(location.search.slice(1));
const searchStateToUrl = (props, searchState) =>
  searchState ? `${props.location.pathname}${createURL(searchState)}` : "";

class App extends React.Component {
  state = {
    searchState: urlToSearchState(this.props.location),
    lastLocation: this.props.location,
  };

  static getDerivedStateFromProps(props, state) {
    if (props.location !== state.lastLocation) {
      return {
        searchState: urlToSearchState(props.location),
        lastLocation: props.location,
      };
    }

    return null;
  }

  onSearchStateChange = (searchState) => {
    clearTimeout(this.debouncedSetState);

    this.debouncedSetState = setTimeout(() => {
      this.props.history.push(
        searchStateToUrl(this.props, searchState),
        searchState
      );
    }, DEBOUNCE_TIME);

    this.setState({ searchState });
  };

  componentDidUpdate(state) {
    console.log(this.state);
  }

  render() {
    let emptyQuery =
      this.state.searchState.query == "" ||
      this.state.lastLocation.search == "";
    console.log(emptyQuery);

    return (
      <div className="ais-InstantSearch">
        <InstantSearch
          indexName="production"
          searchClient={searchClient}
          searchState={this.state.searchState}
          onSearchStateChange={this.onSearchStateChange}
          createURL={createURL}
        >
          <header>
            <hr />
            <span className="logo">
              <a href="./">doctrio</a>
            </span>
            <div
              className="searchBox"
              style={
                emptyQuery
                  ? {
                      visibility: "hidden",
                      width: "40%",
                      marginLeft: "2%",

                      display: "inline-block",
                    }
                  : {
                      visibility: "hidden",
                      width: "40%",
                      marginLeft: "2%",

                      display: "inline-block",
                    }
              }
            ></div>

            <button type="button" className="btn btn-danger">
              Contactez-nous
            </button>
            <hr />
          </header>

          <div
            className="secondBox"
            style={
              emptyQuery
                ? {
                    width: "50%",
                    marginLeft: "25%",
                    marginTop: "20%",
                    position: "fixed",
                  }
                : {
                    width: "50%",
                    marginLeft: "25%",
                    bottom: "92%",
                    height: "5%",
                    position: "fixed",
                    zIndex: "10",
                  }
            }
          >
            <h2 style={emptyQuery ? null : { display: "none" }}>
              Some <a href="place your link here"> title </a> for Nathan
            </h2>
            <div className="line">
              <SearchBox />
            </div>

            <h3
              style={
                emptyQuery
                  ? null
                  : {
                      display: "none",
                    }
              }
            >
              And some <a href="place your link here"> more </a>
            </h3>
          </div>
          <div
            className="isBlank"
            style={
              emptyQuery
                ? { display: "none" }
                : { top: "10%", position: "absolute", width: "100%" }
            }
          >
            <div className="stats">
              <Stats />
            </div>
            <div className="sort">
              <SortBy
                defaultRefinement="production"
                items={[
                  { value: "production", label: "Most relevant" },
                  { value: "production_recent", label: "Most recent" },
                ]}
              />
            </div>
            <div className="row">
              <div className="sidenav">
                <h3>Year</h3>
                <CustomNumericMenu
                  attribute="online"
                  limit={5}
                  items={[
                    { label: "since 2018", start: 1514764800 },
                    { label: "since 2019", start: 1546300800 },
                    { label: "since 2020", start: 1546300800 },
                    { label: "until 2020", end: 1577836800 },
                  ]}
                />

                <h3>Source</h3>
                <RefinementList attribute="source" limit={2} showMore={true} />
              </div>

              <CustomInfiniteHits />
            </div>
            <div className="HPP">
              <HitsPerPage
                defaultRefinement={20}
                items={[{ value: 20, label: "Show 20 hits" }]}
              />
            </div>
          </div>
        </InstantSearch>
      </div>
    );
  }
}

export default App;
