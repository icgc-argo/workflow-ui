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

import React, { useEffect } from "react";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "@apollo/react-hooks";
import { createPortal } from "react-dom";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import { ThemeProvider } from "@icgc-argo/uikit";
import Modal from "@icgc-argo/uikit/Modal";
import { InMemoryCache } from "apollo-cache-inmemory";
import { AppContext, useInitialAppContextState } from 'context/App';
import NavBar from 'components/NavBar';
import Home from "pages/Home";
import Login from "pages/Login";
import LoggedIn from "pages/LoggedIn";
import NoAccess from "pages/NoAccess";
import NotFound from "pages/NotFound";
import Run from "pages/Run";
import Voyagers from "pages/Voyagers";
import { useAuth } from "providers/Auth";
import { setRedirectUrl } from "utils/redirectUrl";
import { css } from "emotion";

const modalPortalRef = React.createRef<HTMLDivElement>();

const ProtectedRoute = ({ path, ...props }: any) => {
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) {
      setRedirectUrl(path);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  return (
    isLoggedIn
      ? <Route path={path} {...props} />
      : <Route render={() => <Redirect to="/login" />} />
  );
};

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
              <NavBar />
              <Switch>
                <Route exact path="/" render={() => <Redirect to="/runs" />} />
                <ProtectedRoute exact path="/runs" component={Home} />
                <Route exact path="/login" component={Login} />
                <Route exact path="/logged-in" component={LoggedIn} />
                <ProtectedRoute
                  exact
                  path="/explorer"
                  render={() => <Voyagers client={client} />}
                  />
                <ProtectedRoute
                  path="/runs/:id"
                  component={(props: { match: { params: { id: string } } }) => (
                    <Run runId={props.match.params.id} />
                  )}
                />
                <Route exact path="/no-access" component={NoAccess} />
                <Route component={NotFound} />
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
