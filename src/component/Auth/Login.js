import React, {Component} from 'react';
import firebase from '../../firebase';
import {Grid, Form, Segment, Button, Header, Message, Icon} from "semantic-ui-react";
import {Link} from "react-router-dom";

class Login extends Component {
    state = {
        email: "",
        password: "",
        errors: [],
        loading: false,
    };

    handleChange = e => {
        this.setState({[e.target.name]: e.target.value})
    };

    displayErrors = errors => errors.map((error, i) => <p key={i}>{error.message}</p>);

    handleInputErrors = (errors, inputName) => {
        return errors.some(error => error.message.toLowerCase().includes(inputName)) ? 'error' : ''
    };

    handleSubmit = e => {
        e.preventDefault();
        if (this.isFormValid(this.state)) {
            this.setState({errors: [], loading: true});
            firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password).then(signedInUser => {
                console.log(signedInUser);
            }).catch(err => {
                console.error(err);
                this.setState({
                    errors: this.state.errors.concat(err),
                    loading: false
                });
            });
        }
    };
    isFormValid = ({email, password}) => email && password;


    render() {
        const {email, password, errors, loading} = this.state;

        return (
            <Grid textAlign={"center"} verticalAlign={"middle"} className={"app"}>
                <Grid.Column style={{maxWidth: '450px'}}>
                    <Header as={"h1"} icon color={"violet"} textAlign={"center"}>
                        <Icon name={"code branch"} color={"violet"}/>
                        Login To DevChat
                    </Header>
                    <Form onSubmit={this.handleSubmit} size={"large"}>
                        <Segment stacked>

                            <Form.Input fluid name={"email"} icon={"mail"} iconPosition={"left"}
                                        placeholder={"Email Address"} value={email} className={this.handleInputErrors(errors, "email")} onChange={this.handleChange}
                                        type={"email"}/>
                            <Form.Input fluid name={"password"} icon={"lock"} iconPosition={"left"}
                                        placeholder={"Password"} value={password} onChange={this.handleChange} className={this.handleInputErrors(errors, "password")}
                                        type={"password"}/>

                            <Button disabled={loading} className={loading ? 'loading' : ''} color={"violet"} fluid
                                    size={"large"}>Login</Button>
                        </Segment>
                    </Form>
                    {errors.length > 0 && (
                        <Message error>
                            <h3>Error</h3>
                            {this.displayErrors(errors)}
                        </Message>
                    )}
                    <Message>Don't have an account? <Link to={"/register"}>Register</Link></Message>
                </Grid.Column>
            </Grid>
        );
    }
}

export default Login;