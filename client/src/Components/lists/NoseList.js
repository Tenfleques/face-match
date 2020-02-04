import React from 'react';
import { connect } from 'react-redux';
import { userActions } from '../../redux';
import {Base64Images} from "../../constants";
import {NoseCard} from "../card"

class NoseList extends React.Component {
  componentDidMount(){
    const {dispatch} = this.props
    dispatch(userActions.getNoses());
  }
  handleDelete(id){
    const {dispatch} = this.props
    dispatch(userActions.deleteTodo(id))
  }
  listNoses(){
    return (!this.props.noses.length && <img src={Base64Images.loading}  alt=""/>) || (this.props.noses && (this.props.noses instanceof Array) && this.props.noses.map(nose => (
      <NoseCard nose={nose} key={Math.random()* new Date().getTime()}/>
    )));
  }
  render() {
      return (
        <div className="container-fluid">
          <div className="row">
            {this.listNoses()}
          </div>
        </div>
      );
  }
}

function mapStateToProps(state) {
    const { noses } = state;
    console.log(state)
    return {
      noses
    };
}
export default connect(mapStateToProps)(NoseList)