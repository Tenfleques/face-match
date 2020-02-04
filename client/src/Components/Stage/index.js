import React, {Component} from "react";
import AnimateLoad from "../../HOCS/AnimateLoad"
import ServerConstants from "../../Configs/Constants/server_constants.json";
import InfoCard from "../../Components/card/info";
import Utils from "../../utilities";

const ImageStage = AnimateLoad(class ImageStage extends Component{
    constructor(props) {
        super(props)
        this.state = {
            image: props.image,
            distance : props.distance,
            stage_image : ""
        }
    }
    componentDidUpdate(prevProps){
        if(prevProps.image.name !== this.props.image.name){
            this.setState({ 
                image   : this.props.image,
                distance: this.props.distance,
                stage_image : ""
            }, () => {
                this.drawImage(); 
            })
        }
    }
    componentDidMount(){
        this.drawImage();    
    }
    drawImage(){
        var img = new Image();
        img.crossOrigin = "Anonymous";
        const box = this.state.image.box; 
        img.onload = (me) => {            
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            

            canvas.width = me.path[0].naturalWidth;   
            canvas.height = me.path[0].naturalHeight;

            const scale = canvas.width/ServerConstants.images.scale;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.drawImage(me.path[0], 0, 0)

            ctx.strokeStyle = "green";
            ctx.lineWidth = "3";
            ctx.strokeRect(box[0]*scale, box[1]*scale, box[2]*scale, box[3]*scale);

            this.setState({
                stage_image : canvas.toDataURL("image/png")
            })   
        }
        img.src = document.getElementById(this.state.image.name).src;   
    }
    render(){
        return  <InfoCard 
                    title={
                            (Utils.TextUtils.getLocalCaption("_image_match_distance_title") 
                            + ": "
                         
                            + this.state.distance.distance)
                        }
                    className={this.props.className}
                    content={<img 
                                className="img-fluid"
                                src={this.state.stage_image || "images/placeholder.png"}
                            />  
                        }
                />
                // <div className={this.props.className} >
                //     <span className="Title h4 py-3">
                //         {this.state.distance.distance}
                //     </span>
                //     <div className="row py-3">
                //         <div className="col-12"> 
                //             <img 
                //                 className="img-fluid"
                //                 src={this.state.stage_image || "images/placeholder.png"}
                //             />   
                //         </div>
                //     </div>            
                // </div>;        
    }
});

export default ImageStage;