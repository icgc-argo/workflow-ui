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

import React, { useEffect, useContext, useState } from 'react';
import egoUtils from '@icgc-argo/ego-token-utils';
import memoize from 'lodash/memoize';
import Cookies from 'js-cookie';
import { EGO_JWT_KEY, EGO_PUBLIC_KEY_URL, RDPC_POLICY_NAME, IGNORE_EGO } from 'config/globals';

type T_AuthContext = [
  [string, React.Dispatch<React.SetStateAction<string>>],
  [string, React.Dispatch<React.SetStateAction<string>>],
  [boolean, React.Dispatch<React.SetStateAction<boolean>>]
];

const fetchEgoPublicKey = async () => {
  const response = fetch(EGO_PUBLIC_KEY_URL, {
    method: 'GET',
    mode: 'cors',
  });

  return await response;
};

const BEGIN_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----`;
const END_PUBLIC_KEY = `-----END PUBLIC KEY-----`;

// convert from multiline to single line for use with egoUtils
const formatPublicKeyForEgoUtils = (key: string) => {
  const keyData = key
    .replace(BEGIN_PUBLIC_KEY, ``)
    .replace(END_PUBLIC_KEY, ``)
    .trim();
  return `${BEGIN_PUBLIC_KEY}\n${keyData}\n${END_PUBLIC_KEY}`;
}

export const AuthContext = React.createContext<T_AuthContext>([['', () => {}], ['', () => {}], [true, () => {}]]);

export const AuthProvider = ({ children }: any) => {
  const [token, setToken] = useState<string>('');
  const [egoPublicKey, setEgoPublicKey] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const configureEgoPublicKey = async () => {
    setLoading(true);
    const key =
      await fetchEgoPublicKey()
        .then(res => res.status === 200 ? res.text() : '')
        .then(data => {
          return formatPublicKeyForEgoUtils(data);
        })
        .catch(err => {
          console.error('Unexpected error occured while fetching ego public key: ', err);
          return '';
        });
  
    setEgoPublicKey(key);
    setLoading(false);
  };

  useEffect(() => {
    if (IGNORE_EGO) {
      setLoading(false);
    } else {
      configureEgoPublicKey();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={
        [
          [token, setToken],
          [egoPublicKey, setEgoPublicKey],
          [loading, setLoading]
        ]
      }
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const [
    [token, setTokenState],
    [egoPublicKey, ],
    [loading, ]
  ] = useContext(AuthContext);

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
  };

  const clearToken = () => {
    Cookies.remove(EGO_JWT_KEY);
    setTokenState('');
  };

  const getEgoPublicKey = (): string => {
    if (IGNORE_EGO) {
      return 'IGNORE_EGO=true';
    }

    if (!egoPublicKey) {
      return '';
    }

    return egoPublicKey;
  };

  const getPermissions = (token?: string) => {
    if (token) {
      return getPermissionsFromToken(token) || [];
    }

    return getPermissionsFromToken(getToken()) || [];
  };

  const getUserModel = () => {
    if (IGNORE_EGO) {
      return {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
      };
    }

    if (isValidJwt(getToken())) {
      const data = decodeToken(getToken());
      if (data && data.context && data.context.user) {
        return data.context.user;
      }
    }

    return null;
  };

  const isLoggedIn = (): boolean => {
    if (IGNORE_EGO) {
      return true;
    }

    return isValidJwt(getToken());
  };

  const decodeToken = memoize((egoJwt?: string) =>
    egoJwt ? egoUtils(egoPublicKey).decodeToken(egoJwt) : null,
  );

  const isValidJwt = (egoJwt: string): boolean =>
    !!egoJwt && !!egoUtils(getEgoPublicKey()).isValidJwt(egoJwt);

  const getPermissionsFromToken: (egoJwt: string) => string[] = (egoJwt) =>
    isValidJwt(egoJwt)
      ? egoUtils(getEgoPublicKey()).getPermissionsFromToken(egoJwt)
      : [];

  const canRead = (token?: string) => {
    if (token) {
      return getPermissionsFromToken(token).filter(permission => permission.toLowerCase().startsWith(`${RDPC_POLICY_NAME}.READ`.toLowerCase())).length > 0;
    }

    return getPermissions().filter(permission => permission.toLowerCase().startsWith(`${RDPC_POLICY_NAME}.READ`.toLowerCase())).length > 0;
  };

  const canWrite = (token?: string) => {
    if (IGNORE_EGO) {
      return true;
    }

    if (token) {
      return getPermissionsFromToken(token).filter(permission => permission.toLowerCase().startsWith(`${RDPC_POLICY_NAME}.WRITE`.toLowerCase())).length > 0;
    }

    return getPermissions().filter(permission => permission.toLowerCase().startsWith(`${RDPC_POLICY_NAME}.WRITE`.toLowerCase())).length > 0;
  };
    
  const isDccMemberUtil = (permissions: string[]): boolean =>
    egoUtils(getEgoPublicKey()).isDccMember(permissions);

  const isDccMember = (token?: string) => {
    if (token) {
      return isDccMemberUtil(getPermissions(token));
    }

    return isDccMemberUtil(getPermissions());
  };
  
  const isRdpcMember = (permissions: string[]): boolean =>
    egoUtils(getEgoPublicKey()).isRdpcMember(permissions);

  return {
    token: getToken(),
    setToken,
    clearToken,
    egoPublicKey: getEgoPublicKey(),
    loading,
    userModel: getUserModel(),
    isLoggedIn: isLoggedIn(),
    isValidJwt,
    isMember: canRead,
    isAdmin: canWrite,
    isDccMember,
    isRdpcMember,
  };
};
