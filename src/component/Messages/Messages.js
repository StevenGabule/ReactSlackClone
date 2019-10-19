import React, {Component, Fragment} from 'react';
import firebase from '../../firebase';
import {Segment, Comment} from "semantic-ui-react";
import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessageForm";
import Message from "./Message";


class Messages extends Component {
    state = {
        messagesRef: firebase.database().ref("messages"),
        messages: [],
        messagesLoading: true,
        channel: this.props.currentChannel,
        user: this.props.currentUser,
    };

    componentDidMount() {
        const {channel, user} = this.state;
        if (channel && user) {
            this.addListeners(channel.id);
        }
    }

    addListeners = channelId => {
        this.addMessageListener(channelId);
    };

    addMessageListener = channelId => {
        let loadedMessages = [];
        this.state.messagesRef.child(channelId).on("child_added", snap => {
            loadedMessages.push(snap.val());
            this.setState({
                messages: loadedMessages,
                messagesLoading: false
            })
        });
    };

    displayMessages = messages => (
        messages.length > 0 && messages.map(message => (
            <Message key={message.timestamp} message={message} user={this.state.user}/>
        ))
    );

    render() {
        const {messagesRef, channel, user, messages} = this.state;
        return (
            <Fragment>
                <MessagesHeader/>
                <Segment>
                    <Comment.Group className={"messages"}>
                        {this.displayMessages(messages)}
                    </Comment.Group>
                </Segment>
                <MessageForm
                    currentUser={user}
                    messagesRef={messagesRef}
                    currentChannel={channel}/>
            </Fragment>
        );
    }
}

export default Messages;