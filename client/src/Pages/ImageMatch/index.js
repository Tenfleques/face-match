import React from 'react';
import Utils from "../../utilities";
import FileUploader from "../../Components/FileUploader";
import ImageStage from "../../Components/Stage";
import FileList from "../../Components/FileList";
import APIEndpoints from "../../Configs/Constants/api.json";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome} from '@fortawesome/free-solid-svg-icons'
import InfoCard from "../../Components/card/info"



const UPLOAD = 1, MATCH = 2;

class ImageMatch extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            view : UPLOAD,
            wilds : [],
            targets : [],
            distances : [],
            target : null,
            stage : null,
            distance : ""
        }
        this.onClickTarget = this.onClickTarget.bind(this);
        this.onUploadSuccess = this.onUploadSuccess.bind(this);
        this.getImageMatches = this.getImageMatches.bind(this);
        this.onClickWild = this.onClickWild.bind(this);
    }
    
    componentDidMount(){
        this.getImageMatches();
    }
    onClickTarget(f){
        this.getImageMatches(f.name, () => {
            this.setState({target : f});
        });        
    }
    
    onClickWild(f){
        if (this.state.target === null){
            return;
        }
        let distance = this.state.distances.find((a) => a.key === f.key);
        this.setState({view : MATCH, stage : f, distance : distance}, () => {
            //console.log(f);
        }) 
    }
    formatImageCaption(obj, target){
        obj.caption =  <div className={(obj.name === target? "bg-danger" : "") + " col-12 card px-0 my-2"}>
                <picture>
                    <img id={obj.name} src={APIEndpoints.matches.url +  obj.image} className="card-img-top" alt="" />
                    <img src="images/placeholder.png" className="img-fluid" alt="" />
                </picture>
                <div className="card-body">
                    <h5 className="card-title">
                        {obj.name}
                    </h5>
                </div>
            </div>
        return obj;
    }
    getImageMatches(target, cb){
        let url;
        if(target){
            url = APIEndpoints.matches.url + "/" + APIEndpoints.matches.endpoints.images.name + "?target=" + target;
        }else{
            url = APIEndpoints.matches.url + "/" + APIEndpoints.matches.endpoints.images.name;
        }
        let formatter = this.formatImageCaption;

        fetch(url, {method: 'GET'})
        .then(res => res.json())
        .then(res => {
            let wilds = [],
            targets = [],
            distances = [];
            
            for (let i = 0; i < res.length; ++i){
                let tw = res[i];
                distances.push({
                    "distance" : tw.distance,
                    "key" : tw.key
                });
                let t_index = targets.findIndex((a) => {
                    return a.name == tw["target"].name
                });
                let w_index = wilds.findIndex((a) => {
                    return a.name == tw["wild"].name
                });
                
                if(w_index === -1){
                    wilds.push(formatter(tw["wild"]));
                }
                
                if(t_index === -1){
                    targets.push(formatter(tw["target"], target));
                }
            };

            this.setState({
                distances,
                wilds,
                targets
            }, () => {
                if(cb){
                    cb();
                }
            });
        })
        .catch(error => {
            console.error(error)
        });
    }
    onUploadSuccess(){
        let f = this.getImageMatches;
        return setTimeout(()=>{
            f();
        }, 3*1000);
    }
    
    targetsListRitle(){
        return <div className="row">
            <div className="col-12">
                {this.state.target 
                    && (<FontAwesomeIcon 
                            icon={faHome}
                            className="mr-3 mouse-pointer" 
                            onClick={() => {
                                this.getImageMatches("", () => {
                                    this.setState({view : UPLOAD, stage : null, target : null});
                                });                 
                            }
                        }
                    />)}
                
                {Utils.TextUtils.getLocalCaption("_target")}
            </div>
        </div>
    }
    render () {
        return (
            <div className="">            
                <div className="container-fluid mt-5">
                    <div className="row">
                        <div className="col-12 h3">
                            {Utils.TextUtils.getLocalCaption("_image_match_page")}
                        </div>
                    </div>
                </div>
                <div className="container-fluid">
                    <div className="row px-3">
                        <FileList 
                            files={this.state.wilds} 
                            onClickFile={this.onClickWild}
                            className="card pt-3 col-3 " 
                            title={Utils.TextUtils.getLocalCaption("_wild")}/>
                        <div id="match-stage" className="col-6">
                            {this.state.view === UPLOAD ? 
                                (this.state.target?
                                    <InfoCard 
                                        title={Utils.TextUtils.getLocalCaption("_info_select_wild_title")}
                                        className="card col-12"
                                        content={Utils.TextUtils.getLocalCaption("_info_select_wild_content")}
                                    />
                                    : <FileUploader 
                                            title={Utils.TextUtils.getLocalCaption("_upload_images_title")}
                                            onUploadSuccess={this.onUploadSuccess} />)
                            : <ImageStage distance={this.state.distance} image={this.state.stage}  className="card col-12" /> }
                        </div>
                        <FileList 
                            onClickFile={this.onClickTarget} 
                            files={this.state.targets} 
                            className="card pt-3 col-3 min-h-85" 
                            title={this.targetsListRitle()}/>  
                    </div>            
                </div>
                
            </div>      
        );
    }
}

export default ImageMatch;
  