import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image } from 'react-bootstrap';
import { ThemeContext } from "../../Theme.js";

export default function Logo(props) {

  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);

  let width = props.width || "60";
  let type = props.type || "logo";

  if (type === 'icon') {
    return (
      <Image src="/logo.png" style={{ width: width + 'px' }} />
    )
  } else {
    return (
      <Image src={theme === "dark-theme" ? "/logo.svg" : "/logo-light.svg"} style={{ width: width + 'px' }} />
    )
  }
}
