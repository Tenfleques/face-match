import React, { Component } from "react";
import Dropzone from "../dropzone/Dropzone";
import "./Upload.css";
import Utils from "../../../utilities"
import ApiEndpoints from "../../../Configs/Constants/api.json"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faCheckCircle, faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons'



class Upload extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      files: [],
      uploading: false,
      uploadProgress: {},
      successfullUploaded: false
    };

    this.onFilesAdded = this.onFilesAdded.bind(this);
    this.uploadFiles = this.uploadFiles.bind(this);
  }
  
  componentDidUpdate(prevProps){
    if(prevProps.root !== this.props.root){
      this.setState({catalog : this.props.root})
    }
  }

  onFilesAdded(files) {
    this.setState(prevState => ({
      files: prevState.files.concat(files.filter((f) => {
        return prevState.files.findIndex(a => a.name === f.name) === -1
      }))
    }));
  }

  async uploadFiles(e) {
    this.setState({ uploadProgress: {}, uploading: true });
    var data = new FormData();
    data.append("destination", e.target.id);
    
    let uploadProgress = {};
    let filenames = []
    for (const file of this.state.files) {
      filenames.push(file.name);
      uploadProgress[file.name] = {
        "state" : "loading"
      }
      data.append('images',file,file.name)
    }
    this.setState({ uploadProgress });
    fetch(ApiEndpoints.uploads.url + "/" + ApiEndpoints.uploads.endpoints.images.name, {
      method: 'POST',
      body: data
    })
    .then(res => {
      let delay = 1000;
      let interval = null;
      let index = 0;

      if(!res.error || res.error === undefined){
        interval = setInterval(() => {
          if(index < filenames.length){
            uploadProgress[filenames[index]].state = "done";
            this.setState({ uploadProgress })
            index += 1;
          }else{
            clearInterval(interval);
            this.setState({ files: [], uploading: false }, () =>{
              return this.props.onUploadSuccess();
            });
          }
        }, delay);   
      }
    })
    .catch(error => {
      console.error(error)
    })
  }

  renderProgress(file_name) {
    const uploadProgress = this.state.uploadProgress[file_name];
    if (this.state.uploading) {
      return (
        <span className="d-inline pl-3">
            <FontAwesomeIcon icon={faCheckCircle} className={uploadProgress && uploadProgress.state === "done"?
            "text-secondary" : "d-none" } />
             <FontAwesomeIcon icon={faSpinner} className={uploadProgress && uploadProgress.state === "loading"?
            "text-warning fa-spin" : "d-none"} />                   
        </span>
      );
    }
  }
  render() {
      return (
        <div className={this.props.className}>
          <span className="Title h4 py-3">
            {this.props.title}
          </span>
          <div className="row pt-3">
            <div className="col-12 col-md-8 col-lg-6"> 
              <Dropzone
                onFilesAdded={this.onFilesAdded}
                disabled={this.state.uploading}
              />
            </div>
            <div className="col-12 col-md-4 col-lg-6 px-0">
              <div className="row text-left">
                {this.state.files.map(file => {
                  let show_f_name = file.name.toLowerCase().slice(0, file.name.lastIndexOf("."));

                  return (
                    <div key={show_f_name + Math.floor(Math.random() * 1000)} className="col-12 col-md-6 px-1">
                      <span className="">{show_f_name}</span>
                      {this.renderProgress(file.name)}
                    </div>
                  );
                })}
              </div>            
            </div>
          </div>
          <div className="row px-3 border-top py-2 mt-2">
                <button 
                    id="wild" 
                    className="btn btn-danger square border-primary mr-auto" 
                    onClick={this.uploadFiles}>
                        <FontAwesomeIcon icon={faCloudUploadAlt} /> &nbsp;
                        {Utils.TextUtils.getLocalCaption("_wild")}
                </button>
                <button 
                    id="target" 
                    className="btn btn-tranparent square border-primary ml-auto" 
                    onClick={this.uploadFiles}>
                        {Utils.TextUtils.getLocalCaption("_target")}  &nbsp; 
                        <FontAwesomeIcon icon={faCloudUploadAlt} /> 
                </button>                                    
              </div>
        </div> 
      );
    }
}

export default Upload;
