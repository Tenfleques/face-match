import React from 'react';
import { connect } from 'react-redux';

import { userActions } from '../../redux';

class AddNoseForm extends React.Component {
    constructor(props) {
        super(props);            
        this.state = {
            title: '',
            description: '',
            submitted: false,
            collapsed: false
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleCollapseForm = this.handleCollapseForm.bind(this);
    }
    handleChange(e) {
        const { name, value } = e.target;
        this.setState({ [name]: value });
    }
    handleCollapseForm(){
      this.setState({
        collapsed: !this.state.collapsed
      })
    }
    handleSubmit(e) {
        e.preventDefault();
        this.setState({ submitted: true });
        const { title, description } = this.state;
        const { dispatch } = this.props;
        if (title && description) {
            let res = userActions.addTodo(title, description)
            dispatch(res);
            console.log(res)
            /*res.then(r => this.setState({
                title: '',
                description: '',
                submitted: false
            }))*/
            
        }
    }

    render() {
        const { title, description, submitted } = this.state;
        return (
            <div className="col-12">
                <form className="row max-w-600px mr-auto" onSubmit={this.handleSubmit}>
                    <h4 className="text-primary col-12">
                      Добавьте новый нос
                      <span onClick={this.handleCollapseForm} className="ml-3 h1">{this.state.collapsed? "-" : "+"}</span>
                    </h4>
                    <div className={"col-12 " + (this.state.collapsed? "" : "d-none")}>
                      <div className="collapse-form row" >
                        <div className='form-group col-12'>
                            <label htmlFor="title">название</label>
                            <input
                                type="text"
                                name="title"
                                value={title}
                                className={"form-control col-12 mb-3" + (submitted && !title ? ' border-danger' : '')}
                                onChange={this.handleChange}
                            />
                            {submitted && !title &&
                                <div className="text-danger">требуется название носа</div>
                            }
                        </div>
                        <div className='form-group col-12'>
                            <label htmlFor="description">описание носа</label>
                            <textarea
                                type="description"
                                name="description"
                                value={description}
                                className={"form-control col-12 mb-3" + (submitted && !description ? ' border-danger' : '')}
                                onChange={this.handleChange}
                            >
                            </textarea>
                            {submitted && !description &&
                                <div className="text-danger">требуется описние носа</div>
                            }
                        </div>
                        <div className="form-group col-12">
                            <button 
                                type="submit"
                                className="form-control col-12 mb-3"
                            >
                                Сохранить 
                            </button>
                            
                        </div>
                      </div>  
                    </div>
                </form>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        state
    };
}
export default connect(mapStateToProps)(AddTodoForm)