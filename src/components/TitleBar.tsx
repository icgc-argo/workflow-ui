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

import React from 'react';
import { css } from 'emotion';
import { useTheme } from "@icgc-argo/uikit/ThemeProvider";
import { RDPC_REGION } from 'config/globals';

type TitleBarProps = {
  page: string
};

const TitleBar = ({ page }: TitleBarProps) => {
  const theme = useTheme();

  return (
    <>
      <h1
        style={
          {
            ...theme.typography.title,
            marginTop: 0
          }
        }
      >
        RDPC <span className={css`text-transform: capitalize;`}>{RDPC_REGION}</span>: {page}
      </h1>
      <hr
        className={css`
          height: 1px;
          background-color: ${theme.colors.grey_2};
          margin: 0 0 10px -20px;
          width: 100vw;
          border: 0;
        `}  
      />
    </>
  );
};

export default TitleBar;
