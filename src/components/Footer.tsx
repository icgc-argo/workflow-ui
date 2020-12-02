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
import Footer from "@icgc-argo/uikit/Footer";
import { css } from "emotion";
import { useTheme } from "@icgc-argo/uikit/ThemeProvider"
import {
  ARGO_DATA_PLATFORM_PAGE,
  ARGO_CONTACT_PAGE,
  ARGO_DOCS_PAGE,
  ARGO_PRIVACY_PAGE,
  ARGO_TERMS_PAGE
} from 'config/argoPages';
import { APP_VERSION, MANAGEMENT_API_STATUS_URL } from "config/globals";

export default () => {
  const theme = useTheme();
  const [apiVersion, setApiVersion] = useState(null);

  useEffect(() => {
    fetch(MANAGEMENT_API_STATUS_URL, {
      method: 'GET',
      mode: 'cors',
    })
    .then(res => res.json())
    .then(data => {
      setApiVersion(data.workflow_engine_versions.nextflow);
    })
    .catch(err => {
      console.warn(err);
    });
  }, []);

  return (
    <Footer
      version={APP_VERSION}
      apiVersion={apiVersion}
      className={css`
        padding: 0 24px;
        background: ${theme.colors.white};
        z-index: 1;
        border-top: 1px solid ${theme.colors.grey_2};
        flex-shrink: 0;
      `}
      links={[
        {
          displayName: 'ARGO Data Platform',
          href: ARGO_DATA_PLATFORM_PAGE,
          target: '_blank',
        },
        {
          displayName: 'Contact',
          href: ARGO_CONTACT_PAGE,
          target: '_blank',
        },
        {
          displayName: 'Documentation',
          href: ARGO_DOCS_PAGE,
          target: '_blank',
        },
        {
          displayName: 'Privacy Policy',
          href: ARGO_PRIVACY_PAGE,
          target: '_blank',
        },
        {
          displayName: 'Terms & Conditions',
          href: ARGO_TERMS_PAGE,
          target: '_blank',
        },
      ]}
    />
    );
};
