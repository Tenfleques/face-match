import React from 'react';
import {Link} from 'react-router-dom';
import { useLocation } from "react-router-dom";
import Locale from "../../_locale/"
import Utils from "../../utilities/"

const NavBar = (props) => {

  let location = useLocation();

  return (
    <nav className={"navbar navbar-dark bg-primary fixed-top " + props.className} >
      {props.navs.map((a) => 
        <Link key={a.link} className={"nav-item text-white no-underline " + (location.pathname === a.link ? "border-bottom border-2x border-danger": "")} to={a.link}>
        {Locale[Utils.AgentUtils.getAgentLocale()][a.caption].title}
      </Link>
      )}
    </nav>
  );
}

export default NavBar;