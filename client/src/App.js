import React, { Component } from 'react';
import { HashRouter, Route } from 'react-router-dom';
// import PrivateRoute from "./Components/privateRoute"

import SupportPage from "./Pages/Support";
import Home from "./Pages/Home";
import ImageMatch from "./Pages/ImageMatch";
import VideoMatch from "./Pages/VideoMatch";
import Login from "./Pages/Auth/Login";

import NavBar from "./Components/navbar";

import PrivateNavs from "./Configs/Routes/private"
import PublicNavs from "./Configs/Routes/public"

import './Css/bootstrap.css';
import './Css/App.css';

class App extends Component {
  render() {
    return (
      <HashRouter basename="">
          {(sessionStorage.getItem('user') 
            && <NavBar navs={PrivateNavs} className="mb-5" /> )
          || <NavBar navs={PublicNavs} className="mb-5" />}
          <Route exact strict path="/login" component={Login} />
          <Route exact path="/" component={Home} />
          {/* <PrivateRoute exact strict  path="/" component={Home} /> */}
          <Route exact strict path="/support" component={SupportPage} />
          <Route exact strict path="/image_match" component={ImageMatch} />
          <Route exact strict path="/video_match" component={VideoMatch} />
      </HashRouter>
    );
  }
}

export default App;
