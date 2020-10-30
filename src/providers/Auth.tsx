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

import React, { useState, useContext } from 'react';
import Cookies from 'js-cookie';
import { EGO_JWT_KEY, EGO_CLIENT_ID } from 'config/globals';
import { decodeToken, isValidJwt, getPermissionsFromToken } from 'utils/egoJwt';

type T_EgoToken = string;
type T_Permissions = string[]; 

type T_AuthContext = [
  [T_EgoToken, React.Dispatch<React.SetStateAction<T_EgoToken>>],
  [T_Permissions, React.Dispatch<React.SetStateAction<T_Permissions>>],
];

export const AuthContext = React.createContext<T_AuthContext>([['', () => {}], [[], () => {}]]);

export const AuthProvider = ({ children }: any) => {
  const [token, setToken] = useState<T_EgoToken>('');
  const [permissions, setPermissions] = useState<T_Permissions>([]);

  return (
    <AuthContext.Provider value={[[token, setToken], [permissions, setPermissions],]}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const [
    [token, setTokenState],
    [permissions, setPermissions]
  ] = useContext(AuthContext);

  const getPermissions = () => {
    return permissions;
  };

  const canRead = () => permissions.filter(permission => permission.toLowerCase().startsWith(`${EGO_CLIENT_ID}.READ`.toLowerCase())).length > 0;

  const canWrite = () => permissions.filter(permission => permission.toLowerCase().startsWith(`${EGO_CLIENT_ID}.WRITE`.toLowerCase())).length > 0;

  const isLoggedIn = (): boolean => {
    return isValidJwt(getToken());
  };

  const getToken = (): string => {
    if (!token && !Cookies.get(EGO_JWT_KEY)) {
      return '';
    }
    
    if (!token && Cookies.get(EGO_JWT_KEY)) {
      return Cookies.get(EGO_JWT_KEY) || '';
    }

    return token;
  };

  const setToken = (token: string) => {
    Cookies.set(EGO_JWT_KEY, token);
    setTokenState(token);
    setPermissions(getPermissionsFromToken(token));
  };

  const clearToken = () => {
    Cookies.remove(EGO_JWT_KEY);
    setTokenState('');
    setPermissions([]);
  };

  const getUserModel = () => {
    if (isValidJwt(getToken())) {
      const data = decodeToken(getToken());
      if (data && data.context && data.context.user) {
        return data.context.user;
      }
    }

    return null;
  };

  return {
    token: getToken(),
    setToken,
    clearToken,
    permissions: getPermissions(),
    userModel: getUserModel(),
    isLoggedIn: isLoggedIn(),
    canRead,
    canWrite,
  };
};
