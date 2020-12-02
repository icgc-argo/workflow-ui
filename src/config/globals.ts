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

import packageJson from './../../package.json';

export const APP_VERSION = packageJson.version;
export const EGO_API_ROOT = process.env.REACT_APP_EGO_API_ROOT;
export const EGO_CLIENT_ID = process.env.REACT_APP_EGO_CLIENT_ID;
export const EGO_JWT_KEY = process.env.REACT_APP_EGO_JWT_KEY || `EGO_JWT`;
export const EGO_PUBLIC_KEY_URL = `${EGO_API_ROOT}/oauth/token/public_key`;
export const EGO_TOKEN_ENDPOINT = `${EGO_API_ROOT}/oauth/ego-token?client_id=${EGO_CLIENT_ID}`;
export const GOOGLE_AUTH_ENDPOINT = `${EGO_API_ROOT}/oauth/login/google?client_id=${EGO_CLIENT_ID}`;
export const RDPC_DOMAIN = process.env.REACT_APP_RDPC_DOMAIN || `RDPC`;
export const RDPC_REGION = process.env.REACT_APP_RDPC_REGION || 'collab';
export const RDPC_POLICY_NAME = `${RDPC_DOMAIN}-${RDPC_REGION}`;
export const MANAGEMENT_API = process.env.REACT_APP_MANAGEMENT_API || ``;
export const MANAGEMENT_API_STATUS_URL = `${MANAGEMENT_API}/service-info`;
export const RDPC_GATEWAY = process.env.REACT_APP_RDPC_GATEWAY || ``;
export const IGNORE_EGO = process.env.REACT_APP_IGNORE_EGO;
