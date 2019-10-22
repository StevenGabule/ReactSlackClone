import React, {Component, Fragment} from 'react';
import firebase from '../../firebase';
import {Segment, Comment} from "semantic-ui-react";
import {connect} from 'react-redux';
import {setUserPosts} from "../../actions";
import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessageForm";
import Message from "./Message";
import Typing from "./Typing";


class Messages extends Component {
    state = {
        privateChannel: this.props.isPrivateChannel,
        privateMessagesRef: firebase.database().ref('privateMessages'),
        messagesRef: firebase.database().ref("messages"),
        messages: [],
        messagesLoading: true,
        channel: this.props.currentChannel,
        isChannelStarred: false,
        user: this.props.currentUser,
        usersRef: firebase.database().ref('users'),
        progressBar: false,
        numUniqueUsers: '',
        handleSearchChange: '',
        searchLoading: false,
        searchResults: [],
        searchTerm: '',
        typingRef: firebase.database().ref('typing'),
        typingUsers: [],
        connectedRef: firebase.database().ref('.info/connected'),
    };

    componentDidMount() {
        const {channel, user} = this.state;
        if (channel && user) {
            this.addListeners(channel.id);
            this.addUserStarsListeners(channel.id, user.uid);
        }
    }

    addUserStarsListeners = (channelId, userId) => {
        this.state.usersRef.child(userId).child('starred').once('value').then(data => {
            if (data.val() !== null) {
                const channelIds = Object.keys(data.val());
                const prevStarred = channelIds.includes(channelId);
                this.setState({isChannelStarred: prevStarred});
            }
        });
    };

    addListeners = channelId => {
        this.addMessageListener(channelId);
        this.addTypingListeners(channelId);
    };

    addTypingListeners = channelId => {
        let typingUsers = [];
        this.state.typingRef.child(channelId).on('child_added', snap => {
            if (snap.key !== this.state.user.uid) {
                typingUsers = typingUsers.concat({
                    id: snap.key,
                    name: snap.val()
                });
                this.setState({typingUsers})
            }
        });

        this.state.typingRef.child(channelId).on('child_removed', snap => {
            const index = typingUsers.findIndex(user => user.id === snap.key);
            if (index !== -1) {
                typingUsers = typingUsers.filter(user => user.id !== snap.key);
                this.setState({typingUsers});
            }
        });
        this.state.connectedRef.on('value', snap => {
            if (snap.val() === true) {
                this.state.typingRef
                    .child(channelId)
                    .child(this.state.user.uid)
                    .onDisconnect()
                    .remove(err => {
                        if (err !== null)
                            console.error(err);
                    })
            }
        })
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
            this.countUserPosts(loadedMessages);
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

    countUserPosts = messages => {
        let userPosts = messages.reduce((acc, message) => {
            if (message.user.name in acc) {
                acc[message.user.name].count += 1;
            } else {
                acc[message.user.name] = {
                    avatar: message.user.avatar,
                    count: 1
                };
            }
            return acc;
        }, {});
        this.props.setUserPosts(userPosts);
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
        return channel ? `${this.state.privateChannel ? '@' : '#'}${channel.name}` : ''
    };

    getMessagesRef = () => {
        const {messagesRef, privateMessagesRef, privateChannel} = this.state;
        return privateChannel ? privateMessagesRef : messagesRef;
    };

    handleStar = () => {
        this.setState(prevState => ({
            isChannelStarred: !prevState.isChannelStarred
        }), () => this.starChannel())
    };

    starChannel = () => {
        if (this.state.isChannelStarred) {
            this.state.usersRef.child(`${this.state.user.uid}/starred`)
                .update({
                    [this.state.channel.id]: {
                        name: this.state.channel.name,
                        details: this.state.channel.details,
                        createdBy: {
                            name: this.state.channel.createdBy.name,
                            avatar: this.state.channel.createdBy.avatar
                        }
                    }
                });
        } else {
            this.state.usersRef
                .child(`${this.state.user.uid}/starred`)
                .child(this.state.channel.id)
                .remove(err => {
                    if (err !== null) {
                        console.error(err)
                    }
                });
        }
    };
    displayTypingUsers = users => (
        users.length > 0 && users.map(user => (
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '0.2em'}} key={user.id}>
                <span className="user__typing">{user.name} is typing</span> <Typing/>
            </div>
        ))
    );


    render() {
        // prettier-ignore
        const {
            messagesRef, channel, user,
            messages, progressBar, numUniqueUsers,
            searchResults, searchTerm, searchLoading, privateChannel, isChannelStarred, typingUsers
        } = this.state;
        return (
            <Fragment>

                <MessagesHeader
                    isPrivateChannel={privateChannel}
                    searchLoading={searchLoading}
                    handleSearchChange={this.handleSearchChange}
                    channelName={this.displayChannelName(channel)}
                    numUniqueUsers={numUniqueUsers} handleStar={this.handleStar} isChannelStarred={isChannelStarred}/>

                <Segment>
                    <Comment.Group className={progressBar ? 'messages__progress' : 'messages'}>
                        {searchTerm
                            ? this.displayMessages(searchResults) : this.displayMessages(messages)}
                        {this.displayTypingUsers(typingUsers)}
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

export default connect(null, {setUserPosts})(Messages);