import React, {Component} from "react";
import ListEntry from "./listEntry";

class FileList extends Component{
    constructor(props) {
        super(props)
        this.state = {
            files: props.files,
            active_ID : null,
            active_class: null
        }
    }
    componentDidMount(){
        this.state = {
            files: this.props.files,
            active_ID : this.props.activeElementID,
            active_class: this.props.activeElementClass
        }
    }
    componentDidUpdate(prevProps){
        let files_diff = JSON.stringify(prevProps.files) !== JSON.stringify(this.props.files);
        if(files_diff){  
            this.setState({ files : this.props.files })
        }
    }   
    
    showFileList(){
        if (this.state.files){  
            let ls = [];
            let used_keys = [];

            for(let i = 0; i < this.state.files.length; ++i){
                let f = this.state.files[i];
                if(used_keys.includes(f.name)){
                    continue;
                }
                ls.push(<ListEntry 
                    key={f.name} 
                    onClick={(e) => this.props.onClickFile(e,f.name)} 
                    caption={f.caption} 
                    className=" mb-2 card d-flex text-secondary " />)
                    used_keys.push(f.name);
            }
            return ls;                              
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