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

import React, { useEffect } from 'react';
import { css } from "emotion";
import DNALoader from "@icgc-argo/uikit/DnaLoader";
import { RouteComponentProps } from 'react-router-dom';

import { ModalPortal } from "App";
import { EGO_TOKEN_ENDPOINT } from 'config/globals';
import { HOME_PAGE_PATH, NO_ACCESS_PAGE_PATH } from 'config/pages'
import { useAuth } from "providers/Auth";
import { getRedirectUrl, clearRedirectUrl } from "utils/redirectUrl";

export default ({ history }: RouteComponentProps) => {
  const { isAdmin, isDccMember, isLoggedIn, isMember, setToken, isValidJwt } = useAuth();
  
  const redirect = () => {
    const redirectUrl = getRedirectUrl();
    if (redirectUrl) {
      clearRedirectUrl();
      history.replace(redirectUrl);
    } else {
      history.replace(HOME_PAGE_PATH);
    }
  };

  const accessDenied = () => {
    history.replace(NO_ACCESS_PAGE_PATH);
  }
  
  useEffect(() => {
    if (isLoggedIn) {
      redirect();
      return;
    }

    fetch(EGO_TOKEN_ENDPOINT, {
      credentials: 'include',
      headers: { accept: '*/*' },
      body: null,
      method: 'GET',
      mode: 'cors',
    }).then(res => {
      return res.status === 200 ? res.text() : '';
    }).then(async jwt => {
      if (isValidJwt(jwt) && (isAdmin(jwt) || isDccMember(jwt) || isMember(jwt))) {
        setToken(jwt);
        redirect();
      } else {
        accessDenied();
      }
    }).catch(err => {
      console.error('Unexpected error occurred after login: ', err);
      accessDenied();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={css`
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 100%;
        margin-top: 64px;
      `}
    >
      <ModalPortal>
        <DNALoader />
      </ModalPortal>
    </div>
  );
};