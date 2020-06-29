import React from "react";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "@apollo/react-hooks";
import { createPortal } from "react-dom";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import AppBar, { Section, MenuGroup, MenuItem } from "@icgc-argo/uikit/AppBar";
import { ThemeProvider } from "@icgc-argo/uikit";
import Modal from "@icgc-argo/uikit/Modal";
import { InMemoryCache } from "apollo-cache-inmemory";
import { AppContext, useInitialAppContextState } from './context/App';
import Home from "./pages";
import Run from "./pages/run";
import Voyagers from "./pages/voyagers";
import { css } from "emotion";
import logo from "./logo.svg";


const modalPortalRef = React.createRef<HTMLDivElement>();

export const ModalPortal: React.ComponentType = ({ children }) => {
  if (modalPortalRef.current) {
    return createPortal(
      <div
        className={css`
          position: fixed;
          height: 100%;
          width: 100%;
        `}
      >
        <Modal.Overlay>{children}</Modal.Overlay>
      </div>,
      modalPortalRef.current
    );
  } else {
    return null;
  }
};

const App: React.FC = () => {
  const client = new ApolloClient({
    uri: process.env.RDPC_GATEWAY,
    cache: new InMemoryCache()
  });

  const globalState = useInitialAppContextState();

  return (
    <AppContext.Provider value={globalState}>
      <ApolloProvider client={client}>
        <ThemeProvider>
          <Router>
            <div
              className={css`
                position: absolute;
                height: 100%;
                width: 100%;
              `}
            >
              <AppBar>
                <Section>
                  <img
                    className={css`
                      padding: 16px;
                    `}
                    src={logo}
                    alt="cargo logo"
                  ></img>
                  <MenuGroup>
                    <Link to="/">
                      <MenuItem>Runs</MenuItem>
                    </Link>
                    <Link to="/voyager">
                      <MenuItem>Voyager</MenuItem>
                    </Link>
                  </MenuGroup>
                </Section>
              </AppBar>

              <Switch>
                <Route exact path="/">
                  <Home />
                </Route>
                <Route exact path="/runs">
                  <Home />
                </Route>
                <Route exact path="/voyager">
                  <Voyagers client={client} />
                </Route>
                <Route
                  path="/runs/:id"
                  component={(props: { match: { params: { id: string } } }) => (
                    <Run runId={props.match.params.id} />
                  )}
                />
              </Switch>
            </div>
            <div
              className={css`
                position: absolute;
                top: 0px;
              `}
              ref={modalPortalRef}
            />
          </Router>
        </ThemeProvider>
      </ApolloProvider>
    </AppContext.Provider>
  );
};

export default App;
