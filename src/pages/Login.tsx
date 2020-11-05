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
import GoogleLogin from '@icgc-argo/uikit/Button/GoogleLogin';
import { RouteComponentProps } from 'react-router-dom';

import { GOOGLE_AUTH_ENDPOINT } from 'config/globals';
import { useAuth } from "providers/Auth";

export default ({ history }: RouteComponentProps) => {
  const { isLoggedIn } = useAuth();

  // redirect users that are already logged in
  useEffect(() => {
    if (isLoggedIn) {
      history.replace('/logged-in');
    }
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
      <h1>COLLAB RDPC</h1>
      <p
        className={css`
          max-width: 480px;
          text-align: center;
        `}
      >
        Access is restricted to RDPC personnel. Please log in to access the collab RDPC workflow information.
      </p>
      <GoogleLogin link={GOOGLE_AUTH_ENDPOINT} />
    </div>
  );
};
