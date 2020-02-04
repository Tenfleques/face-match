import React from 'react';
import { connect } from 'react-redux';
import { userActions } from '../../redux';
import {Base64Images} from "../../constants";
import { ModelCard } from "../card";

class ModelsList extends React.Component {
  componentDidMount(){
    const {dispatch} = this.props
    dispatch(userActions.getModels());
  }
  handleDelete(id){
    const {dispatch} = this.props
    dispatch(userActions.deleteTodo(id))
  }
  listModels(){
    return (!this.props.models.length && <img src={Base64Images.loading}  alt=""/>) || (this.props.models && (this.props.models instanceof Array) && this.props.models.map(model => <ModelCard 
        model={model} 
        key={Math.random() * new Date().getTime()}
      />
    ));
  }
  render() {
      return (
        <div className="container-fluid">
          <div className="row">
            {this.listModels()}
          </div>
        </div>
      );
  }
}

function mapStateToProps(state) {
    const { models } = state;
    return {
      models
    };
}
export default connect(mapStateToProps)(ModelsList)