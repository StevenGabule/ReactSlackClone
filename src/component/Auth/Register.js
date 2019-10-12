import React, {Component} from 'react';
import firebase from '../../firebase';
import {Grid, Form, Segment, Button, Header, Message, Icon} from "semantic-ui-react";
import {Link} from "react-router-dom";

class Register extends Component {
    state = {
        username: "",
        email: "",
        password: "",
        passwordConfirmation: "",
    };

    handleChange = e => {
        this.setState({[e.target.name]: e.target.value})
    };

    handleSubmit = e => {
        e.preventDefault();
        firebase
            .auth()
            .createUserWithEmailAndPassword(this.state.email, this.state.password)
            .then(createUser => {
                console.log(createUser)
            }).catch(err => {
            console.error(err);
        });
    };

    render() {
        const {username, email, password, passwordConfirmation} = this.state;

        return (
            <Grid textAlign={"center"} verticalAlign={"middle"} className={"app"}>
                <Grid.Column style={{maxWidth: '450px'}}>
                    <Header as={"h2"} icon color={"orange"} textAlign={"center"}>
                        <Icon name={"puzzle piece"} color={"orange"}/>
                        Register For DevChat
                    </Header>
                    <Form onSubmit={this.handleSubmit} size={"large"}>
                        <Segment stacked>
                            <Form.Input fluid name={"username"} icon={"user"} iconPosition={"left"}
                                        placeholder={"Username"} value={username} onChange={this.handleChange}
                                        type={"text"}/>
                            <Form.Input fluid name={"email"} icon={"mail"} iconPosition={"left"}
                                        placeholder={"Email Address"} value={email} onChange={this.handleChange}
                                        type={"email"}/>
                            <Form.Input fluid name={"password"} icon={"lock"} iconPosition={"left"}
                                        placeholder={"Password"} value={password} onChange={this.handleChange}
                                        type={"password"}/>
                            <Form.Input fluid name={"passwordConfirmation"} icon={"repeat"} iconPosition={"left"}
                                        placeholder={"Password confirmation"} value={passwordConfirmation}
                                        onChange={this.handleChange} type={"password"}/>
                            <Button color={"orange"} fluid size={"large"}>Submit</Button>
                        </Segment>
                    </Form>
                    <Message>Already a user? <Link to={"/login"}>Login</Link></Message>
                </Grid.Column>
            </Grid>
        );
    }
}

export default Register;