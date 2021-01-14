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

import React, { useEffect, useState } from "react";
import ApolloClient from "apollo-client";
import { createHttpLink } from 'apollo-link-http';
import { ApolloProvider } from "@apollo/react-hooks";
import { createPortal } from "react-dom";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import { ThemeProvider } from "@icgc-argo/uikit";
import DNALoader from "@icgc-argo/uikit/DnaLoader";
import Modal from "@icgc-argo/uikit/Modal";
import { InMemoryCache } from "apollo-cache-inmemory";
import { RDPC_GATEWAY } from 'config/globals';
import {
  HOME_PAGE_PATH,
  LOGIN_PAGE_PATH,
  LOGGED_IN_PAGE_PATH,
  RUNS_PAGE_PATH,
  RUN_PAGE_PATH,
  NO_ACCESS_PAGE_PATH,
  API_EXPLORER_PAGE_PATH
} from 'config/pages';
import { AppContext, useInitialAppContextState } from 'context/App';
import Footer from 'components/Footer';
import NavBar from 'components/NavBar';
import Home from "pages/Home";
import Login from "pages/Login";
import LoggedIn from "pages/LoggedIn";
import NoAccess from "pages/NoAccess";
import NotFound from "pages/NotFound";
import EgoUnavailable from "pages/EgoUnavailable";
import Run from "pages/Run";
import Voyagers from "pages/Voyagers";
import { AuthProvider, useAuth } from "providers/Auth";
import { setRedirectUrl, clearRedirectUrl } from "utils/redirectUrl";
import { css } from "emotion";

const modalPortalRef = React.createRef<HTMLDivElement>();

const ProtectedRoute = ({ path, ...props }: any) => {
  const {
    loading,
    isLoggedIn,
    token,
    getRefreshToken,
    setLoading
  } = useAuth();
  const [refreshToken, setRefreshToken] = useState('');

  const checkRefreshToken = async () => {
    setLoading(true);
    const res = await getRefreshToken()
      .catch(err => console.warn('Unexpected error while refreshing token: ', err));
    if (res) {
      setRefreshToken(res);
      clearRedirectUrl();
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!isLoggedIn) {
      setRedirectUrl(props.location.pathname);
      checkRefreshToken();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isLoggedIn]);

  return (
    loading
      ? null
      : token && (isLoggedIn || refreshToken)
        ? <Route path={path} {...props} />
        : <Route render={() => <Redirect to={LOGIN_PAGE_PATH} />} />
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
  const { loading, egoPublicKey, fetchWithEgoToken } = useAuth();

  const client = new ApolloClient({
    link: createHttpLink({
      uri: RDPC_GATEWAY,
      fetch: fetchWithEgoToken,
    }),
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
                flex: 1 0 auto;
              `}
            >
              <NavBar />
              {
                loading
                  ? <ModalPortal><DNALoader /></ModalPortal>
                  : egoPublicKey
                    ? (
                      <Switch>
                        <Route exact path={HOME_PAGE_PATH} render={() => <Redirect to={RUNS_PAGE_PATH} />} />
                        <ProtectedRoute exact path={RUNS_PAGE_PATH} component={Home} />
                        <Route exact path={LOGIN_PAGE_PATH} component={Login} />
                        <Route exact path={LOGGED_IN_PAGE_PATH} component={LoggedIn} />
                        <ProtectedRoute
                          exact
                          path={API_EXPLORER_PAGE_PATH}
                          render={() => <Voyagers client={client} />}
                          />
                        <ProtectedRoute
                          path={RUN_PAGE_PATH}
                          component={(props: { match: { params: { id: string } } }) => (
                            <Run runId={props.match.params.id} />
                          )}
                        />
                        <Route exact path={NO_ACCESS_PAGE_PATH} component={NoAccess} />
                        <Route component={NotFound} />
                      </Switch>
                    ) : <EgoUnavailable />
              }
            </div>
            <Footer />
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

export default () => <AuthProvider><App/></AuthProvider>;
