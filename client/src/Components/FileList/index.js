import React, {Component} from "react";
import ListEntry from "./listEntry";

class FileList extends Component{
    constructor(props) {
        super(props)
        this.state = {
            files: props.files
        }
    }
    componentDidUpdate(prevProps){
        if(JSON.stringify(prevProps.files) !== JSON.stringify(this.props.files)){
            this.setState({ files : this.props.files})
        }
    }
    
    showFileList(){
        if (this.state.files){  
            return this.state.files.map((f) => {
                return <ListEntry 
                    key={f.key} 
                    onClick={(e) => this.props.onClickFile(f)} 
                    caption={f.caption} 
                    className="d-flex text-secondary" />
            });                                 
        }
        return "";
    }


    render(){
        const def_title = "";
        return (<div className={this.props.className} >
                    <h4>{this.props.title || def_title}</h4>
                    <div className="mh-85 mh-md-85 y-scroll-auto">
                        {this.showFileList()}
                    </div>                    
                </div>);        
    }
}

export default FileList;