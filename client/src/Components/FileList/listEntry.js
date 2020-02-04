import React from "react";
import AnimateLoad from "../../HOCS/AnimateLoad"

const ListEntry =  AnimateLoad((props) => {
    return <div className={props.className + " mouse-pointer"} onClick={props.onClick}>
        {props.caption}
    </div>

});

export default ListEntry;