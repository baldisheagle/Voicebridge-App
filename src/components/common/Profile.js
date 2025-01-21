import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useRequireAuth } from "../../use-require-auth.js";
import { Avatar, DropdownMenu, IconButton } from "@radix-ui/themes";
import { ThemeContext } from "../../Theme";
import { ExitIcon, MoonIcon, SunIcon } from "@radix-ui/react-icons";

export default function Profile() {

  const auth = useRequireAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { theme, toggleTheme } = useContext(ThemeContext);

  const [user, setUser] = useState(null);

  useEffect(() => {
    if (auth && auth.user) {
      setUser(auth.user);
    }
  }, [auth]);

  const signOut = () => {
    if (auth) {
      auth.signout();
    }
    navigate('/');
    return null;
  }

  if (user === null) {
    return null;
  }

  if (location.pathname === '/onboarding' || location.pathname === '/') {
    return (
      <div></div>
    )
  }

  return (
    <div style={{ position: 'fixed', top: 7, right: 5, zIndex: 100, overflowY: 'hidden' }}>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <IconButton variant="soft" size="2">
            <Avatar
              src={user.photoUrl}
              size="2"
              variant="soft"
              radius="large"
              fallback={user.fullName ? user.fullName.charAt(0) : 'P'}
            />
          </IconButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content direction="bottom">
          <DropdownMenu.Item style={{ cursor: 'pointer' }} onClick={() => toggleTheme()}>
            { theme === 'light-theme' ? 
              <div style={{ display: 'flex', alignItems: 'center' }}><MoonIcon style={{ marginRight: 10 }} /> Dark Mode</div> :
              <div style={{ display: 'flex', alignItems: 'center' }}><SunIcon style={{ marginRight: 10 }} /> Light Mode</div>
            }
          </DropdownMenu.Item>
          <DropdownMenu.Item color="red" style={{ cursor: 'pointer' }} onClick={() => signOut()}>
            <ExitIcon style={{ marginRight: 5 }} /> Signout
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>

    </div>
  )

}
