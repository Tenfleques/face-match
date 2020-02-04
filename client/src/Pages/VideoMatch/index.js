import React from 'react';
import Utils from "../../utilities"
import AnimateLoad from "../../HOCS/AnimateLoad"


const VideoMatch = AnimateLoad(class VideoMatch extends React.Component {
    render () {
        return (
            <div className="">            
                <div className="container-fluid mt-5">
                    <div className="row">
                        <div className="col-12 h3">
                            {Utils.TextUtils.getLocalCaption("_image_match_page")}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-4 wild">

                        </div>
                        <div className="col-8 stage">

                        </div>
                    </div>
                </div>
            </div>      
        );
    }
});

export default VideoMatch;
  