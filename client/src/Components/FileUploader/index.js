import React, { Component } from "react";
import "./index.css";
import Upload from "./upload/Upload";

const UploadPage = (props) =>{  
      return (
          <Upload title={props.title} onUploadSuccess={props.onUploadSuccess} className="card col-12" />       
      );
  }

export default UploadPage;
