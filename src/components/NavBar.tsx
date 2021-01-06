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
import { Link, NavLink } from "react-router-dom";
import AppBar, { Section, MenuGroup, MenuItem, UserBadge, DropdownMenu, DropdownMenuItem } from '@icgc-argo/uikit/AppBar';
import GoogleLogin from '@icgc-argo/uikit/Button/GoogleLogin';
import { css } from "emotion";

import Logo from "assets/rdpc-logo.svg";
import Logout from 'components/Logout';
import { GOOGLE_AUTH_ENDPOINT } from 'config/globals';
import { useAuth } from "providers/Auth";

const activeItemStyle = {
  borderBottom: '3px solid #24dbb4',
  paddingTop: '3px'
};

const NavBar: React.FC = () => {
  const {
    token,
    isAdmin,
    isDccMember,
    isLoggedIn,
    isMember,
    userModel,
    loading,
    egoPublicKey,
  } = useAuth();

  const getUserTitle = () => {
    if (isAdmin()) {
      return 'RDPC Admin';
    }
    if (isMember()) {
      return 'RDPC Member';
    }
    if (isDccMember()) {
      return 'DCC Member';
    }
  };

  const UserDropdownMenu = token && isLoggedIn ? (
    <DropdownMenu>
      <DropdownMenuItem
        style={{
          padding: 0
        }}
      >
        <Logout />
      </DropdownMenuItem>
    </DropdownMenu>
  ) : null;

  return (
    <AppBar css={null}>
      <Section>
        <Link to="/">
          <img
            className={css`
              padding: 16px;
            `}
            src={Logo}
            alt="Logo"
          />
        </Link>
        {
          token && isLoggedIn &&
            (
              <MenuGroup>
                <NavLink
                  className={css`
                    text-decoration: none;
                  `}
                  activeStyle={activeItemStyle}
                  to="/runs"
                >
                  <MenuItem>Runs</MenuItem>
                </NavLink>
                <NavLink
                  className={css`
                    text-decoration: none;
                  `}
                  activeStyle={activeItemStyle}
                  to="/explorer"
                >
                  <MenuItem>API Explorer</MenuItem>
                </NavLink>
              </MenuGroup>
            )
          }
      </Section>
      {
        loading || !egoPublicKey
          ? null
          : (
              <Section>
                <MenuGroup>
                  <MenuItem
                    dropdownMenu={UserDropdownMenu}
                  >
                    {
                      token && isLoggedIn ?
                          (
                            <UserBadge
                              firstName={userModel?.firstName}
                              lastName={userModel?.lastName}
                              title={getUserTitle() || userModel?.email}
                            />
                          ) :
                          <GoogleLogin link={GOOGLE_AUTH_ENDPOINT} />
                    }
                  </MenuItem>
                </MenuGroup>
              </Section>
            )
      }
    </AppBar>
  );
};

export default NavBar;
