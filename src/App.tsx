import React from "react";
import ApolloClient from "apollo-client";
import { ApolloProvider } from "@apollo/react-hooks";
import { createPortal } from "react-dom";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { Voyager } from "graphql-voyager";
import AppBar, {
  Section,
  Logo,
  MenuGroup,
  MenuItem
} from "@icgc-argo/uikit/AppBar";
import { ThemeProvider } from "@icgc-argo/uikit";
import Container from "@icgc-argo/uikit/Container";
import Modal from "@icgc-argo/uikit/Modal";
import { SchemaLink } from "apollo-link-schema";
import { InMemoryCache } from "apollo-cache-inmemory";
import schema from "./gql";
import Home from "./pages";
import Run from "./pages/run";
import Voyagers from "./pages/voyagers";
import Workflow from "./pages/workflow";
import { css } from "emotion";
import gql from "graphql-tag";

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
    link: new SchemaLink({ schema }),
    cache: new InMemoryCache()
  });
  return (
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
                <Logo></Logo>
                <MenuGroup>
                  <Link to="/">
                    <MenuItem>Runs</MenuItem>
                  </Link>
                  <Link to="/workflows">
                    <MenuItem>Workflows</MenuItem>
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
              <Route exact path="/workflows">
                <Container
                  className={css`
                    margin: 10px;
                    padding: 10px;
                  `}
                >
                  List of available workflows
                </Container>
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
              <Route
                path="/workflows/:id"
                component={(props: { match: { params: { id: string } } }) => (
                  <Workflow workflowId={props.match.params.id} />
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
  );
};

export default App;
