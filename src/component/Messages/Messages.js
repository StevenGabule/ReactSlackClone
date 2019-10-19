import React, {Component, Fragment} from 'react';
import firebase from '../../firebase';
import {Segment, Comment} from "semantic-ui-react";
import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessageForm";
import Message from "./Message";


class Messages extends Component {
    state = {
        privateChannel: this.props.isPrivateChannel,
        privateMessagesRef: firebase.database().ref('privateMessages'),
        messagesRef: firebase.database().ref("messages"),
        messages: [],
        messagesLoading: true,
        channel: this.props.currentChannel,
        user: this.props.currentUser,
        progressBar: false,
        numUniqueUsers: '',
        handleSearchChange: '',
        searchLoading: false,
        searchResults: [],
        searchTerm: ''
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
        const ref = this.getMessagesRef();
        ref.child(channelId).on("child_added", snap => {
            loadedMessages.push(snap.val());
            this.setState({
                messages: loadedMessages,
                messagesLoading: false
            });
            this.countUniqueUsers(loadedMessages);
        });
    };

    countUniqueUsers = messages => {
        const uniqueUsers = messages.reduce((acc, message) => {
            if (!acc.includes(message.user.name)) {
                acc.push(message.user.name);
            }
            return acc;
        }, []);
        const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
        const numUniqueUsers = `${uniqueUsers.length} user${plural ? 's' : ''}`;
        this.setState({numUniqueUsers})
    };

    displayMessages = messages => (
        messages.length > 0 && messages.map(message => (
            <Message key={message.timestamp} message={message} user={this.state.user}/>
        ))
    );

    isProgressBarVisible = percent => {
        if (percent > 0) {
            this.setState({progressBar: true});
        }
    };

    // displayChannelName = channel => channel ? `#${channel.name}` : '';

    handleSearchChange = e => {
        this.setState({
            searchTerm: e.target.value,
            searchLoading: true
        }, () => this.handleSearchMessages());
    };

    handleSearchMessages = () => {
        const channelMessages = [...this.state.messages];
        const regex = new RegExp(this.state.searchTerm, 'gi');

        const searchResults = channelMessages.reduce((acc, message) => {
            if (message.content && message.content.match(regex) || message.user.name.match(regex)) {
                acc.push(message);
            }
            return acc;
        }, []);
        this.setState({searchResults});
        setTimeout(() => this.setState({searchLoading: false}), 1000);
    };

    displayChannelName = channel => {
        return channel ? `${this.state.privateChannel ? '@': '#'}${channel.name}` : ''
    };

    getMessagesRef = () => {
        const { messagesRef, privateMessagesRef, privateChannel} = this.state;
        return privateChannel ? privateMessagesRef : messagesRef;
    };

    render() {
        // prettier-ignore
        const {messagesRef, channel, user, messages, progressBar, numUniqueUsers, searchResults, searchTerm, searchLoading, privateChannel } = this.state;
        return (
            <Fragment>

                <MessagesHeader
                    isPrivateChannel={privateChannel}
                    searchLoading={searchLoading}
                    handleSearchChange={this.handleSearchChange}
                    channelName={this.displayChannelName(channel)}
                    numUniqueUsers={numUniqueUsers}/>

                <Segment>
                    <Comment.Group className={progressBar ? 'messages__progress' : 'messages'}>
                        {searchTerm ? this.displayMessages(searchResults) : this.displayMessages(messages)}
                    </Comment.Group>
                </Segment>

                <MessageForm
                    currentUser={user}
                    getMessagesRef={this.getMessagesRef}
                    messagesRef={messagesRef}
                    currentChannel={channel}
                    isPrivateChannel={privateChannel}
                    isProgressBarVisible={this.isProgressBarVisible}/>

            </Fragment>
        );
    }
}

export default Messages;