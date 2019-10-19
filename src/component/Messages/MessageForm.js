import React, {Component} from 'react';
import {Button, Input, Segment} from "semantic-ui-react";
import firebase from "../../firebase";

class MessageForm extends Component {
    state = {
        message: '',
        loading: false,
        channel: this.props.currentChannel,
        user: this.props.currentUser,
        errors: [],
    };

    handleChange = e => {
        this.setState({[e.target.name]: e.target.value});
    };

    createMessage = () => {
        return {
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            user: {
                id: this.state.user.uid,
                name: this.state.user.displayName,
                avatar: this.state.user.photoURL
            },
            content: this.state.message
        };
    };

    sendMessage = () => {
        const {messagesRef} = this.props;
        const {message, channel} = this.state;
        if (message) {
            this.setState({loading: true});
            messagesRef.child(channel.id)
                .push()
                .set(this.createMessage()).then(() => {
                this.setState({loading: false, message: '', errors: []});
            }).catch(error => {
                console.error(error);
                this.setState({loading: false, errors: this.state.errors.concat(error)})
            })
        } else {
            this.setState({errors: this.state.errors.concat({message: 'Add a message'})});
        }
    };

    render() {
        const {errors, message, loading} = this.state;
        return (
            <Segment className={"message__form"}>
                <Input fluid
                       name={"message"}
                       onChange={this.handleChange}
                       value={message}
                       style={{marginBottom: '0.7em'}}
                       label={<Button icon={'add'}/>}
                       labelPosition={"left"}
                       className={errors.some(error => error.message.includes('message')) ? 'error' : ''}
                       placeholder={"Write your message"}/>

                <Button.Group icon widths={"2"}>
                    <Button
                        disabled={loading}
                        color={"orange"}
                        onClick={this.sendMessage}
                        content={"Add Reply"}
                        labelPosition={"left"}
                        icon={"edit"}/>
                    <Button color={"teal"} content={"Upload Media"} labelPosition={"right"} icon={"cloud upload"}/>
                </Button.Group>
            </Segment>
        );
    }
}

export default MessageForm;