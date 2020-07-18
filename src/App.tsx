/*
 * Copyright (c) 2020 The Ontario Institute for Cancer Research. All rights reserved
 *
 * This program and the accompanying materials are made available under the terms of the GNU Affero General Public License v3.0.
 * You should have received a copy of the GNU Affero General Public License along with
 * this program. If not, see <http://www.gnu.org/licenses/>.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
 * SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 * IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
 * ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

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
import Graph from "./pages/graph";
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
    uri: process.env.REACT_APP_RDPC_GATEWAY,
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
                    <Link to="/graph">
                      <MenuItem>Graph</MenuItem>
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
                <Route exact path="/graph">
                  <Graph />
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
