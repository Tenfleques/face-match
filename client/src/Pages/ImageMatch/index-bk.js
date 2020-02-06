import React from 'react';
import Utils from "../../utilities";
import FileUploader from "../../Components/FileUploader";
import ImageStage from "../../Components/Stage/index-bk";
import FileList from "../../Components/FileList/index-bk";
import APIEndpoints from "../../Configs/Constants/api.json";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome} from '@fortawesome/free-solid-svg-icons'
import InfoCard from "../../Components/card/info"
import ServerConstants from "../../Configs/Constants/server_constants.json";

const UPLOAD = 1, MATCH = 2;

class ImageMatch extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            view : UPLOAD,
            wilds : [],
            targets : [],
            target : null,
            target_ID : null,
            stage : null,
            distance : ""
        }
        this.onClickTarget = this.onClickTarget.bind(this);
        this.getImageMatches = this.getImageMatches.bind(this);
        this.onClickWild = this.onClickWild.bind(this);
    }
    
    componentDidMount(){
        const user_watch = localStorage.getItem("watch");
        if(!user_watch){
            localStorage.setItem("watch", "watch" + Math.random() + Date.now());
        }
        const url = APIEndpoints.watch.url + "/" + APIEndpoints.watch.endpoints.images.name + "?" + user_watch;

        if (!!window.EventSource) {

            const eventSource = new EventSource(url)
            
            // eventSource

            eventSource.onerror= (e) => {
                eventSource.close();
            };
            eventSource.onopen = (e) =>{
                console.log(e);
            }
            eventSource.addEventListener('update', (e) => {                
                this.updateLists(JSON.parse(e.data), this.state.target);
            });
          } else {
            setInterval(this.getImageMatches(), ServerConstants.polling.time)
          }
    }
    onClickTarget(e, f){
        let target = this.state.targets.find((t) => t.name = f);
        this.setState({target : target, target_ID: target.name, view : MATCH, stage: null, distance : null});
    }
    
    onClickWild(e, f){
        if (this.state.target === null){
            return;
        }

        let stage = this.state.wilds.find((a) => a.name === f);
        let distance = this.state.target.distances.find((a) => a.key === this.state.target.name + f);

        if(distance){
            this.setState({view : MATCH, stage : stage, distance : distance}) 
        }
    }

    formatImageCaption(obj, d){
        obj.caption =  <div className="col-12 px-0">
                <picture>
                    <img id={obj.name} src={APIEndpoints.matches.url +  obj.image} className="card-img-top" alt="" />
                    <img src="images/placeholder.png" className="img-fluid" alt="" />
                </picture>
                <div className="card-body py-0">
                    <h5 className="card-title">
                        {obj.name}
                    </h5>
                </div>
            </div>
        obj.distances = [d];

        return obj;
    }
    updateLists(data, target){
        let wilds = [],
            targets = [];
        if (data.length === 0 && target === null){
            return this.setState({target : target});
        }

        for (let i = 0; i < data.length; ++i){
            let tw = data[i];
            let d = {
                "distance" : tw.distance,
                "key" : tw.key
            };
            
            let t_index = targets.findIndex((a) => {
                return a.name === tw["target"].name
            });
            let w_index = wilds.findIndex((a) => {
                return a.name === tw["wild"].name
            });
            
            if(w_index === -1){
                wilds.push(this.formatImageCaption(tw["wild"], d));
            }else{
                wilds[w_index].distances.push(d);
            }
            
            if(t_index === -1){
                targets.push(this.formatImageCaption(tw["target"], d));
            }else{
                targets[t_index].distances.push(d);
            }
        };

        this.setState({
            wilds,
            targets
        });
    }

    getImageMatches(target, cb){
        let url;
        if(target){
            url = APIEndpoints.matches.url + "/" + APIEndpoints.matches.endpoints.images.name + "?target=" + target;
        }else{
            url = APIEndpoints.matches.url + "/" + APIEndpoints.matches.endpoints.images.name;
        }

        fetch(url, {method: 'GET'})
        .then(res => res.json())
        .then(res => {
            this.updateLists(res, target, cb);
        })
        .catch(error => {
            console.error(error)
        });
    }
    
    targetsListTitle(){
        return <div className="row">
            <div className="col-12">
                {this.state.target 
                    && (<FontAwesomeIcon 
                            icon={faHome}
                            className="mr-3 mouse-pointer" 
                            onClick={() => {
                                this.updateLists([],"", () => {
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
                            activeClassName="bg-warning"
                            activeElementID={this.state.stage ? this.state.stage.key : null}
                            title={Utils.TextUtils.getLocalCaption("_wild")}/>
                        <div id="match-stage" className="col-6">
                            {this.state.view === UPLOAD 
                                && <FileUploader 
                                            title={Utils.TextUtils.getLocalCaption("_upload_images_title")}
                                            onUploadSuccess={() => {/** to do upload success function */}} />
                            }

                            {
                                this.state.stage 
                                && <ImageStage distance={this.state.distance} image={this.state.stage}  className="card col-12 mh-85 mh-md-85" /> }
                            {
                                this.state.view === MATCH 
                                && !this.state.stage 
                                && <InfoCard 
                                title={Utils.TextUtils.getLocalCaption("_info_select_wild_title")}
                                className="card col-12"
                                content={Utils.TextUtils.getLocalCaption("_info_select_wild_content")}
                            />
                            }
                        </div>
                        <FileList 
                            onClickFile={this.onClickTarget} 
                            files={this.state.targets} 
                            activeClassName="bg-danger"
                            activeElementID={this.state.target_ID}
                            className="card pt-3 col-3 min-h-85" 
                            title={this.targetsListTitle()}/>  
                    </div>            
                </div>
                
            </div>      
        );
    }
}

export default ImageMatch;
  