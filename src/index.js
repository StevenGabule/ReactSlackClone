import React from 'react';
import ReactDOM from 'react-dom';
import App from './component/App';
import * as serviceWorker from './serviceWorker';
import firebase from "./firebase";
import Login from "./component/Auth/Login";
import Register from "./component/Auth/Register";
import 'semantic-ui-css/semantic.min.css'

import {BrowserRouter as Router, Switch, Route, withRouter} from "react-router-dom";
import {createStore} from "redux";
import {connect, Provider} from "react-redux";
import {composeWithDevTools} from "redux-devtools-extension";
import rootReducer from "./reducers";
import {setUser, clearUsers} from './actions';
import Spinner from "./Spinner";

const store = createStore(rootReducer, composeWithDevTools());


class Root extends React.Component {
    componentDidMount() {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                // console.info(user);
                this.props.setUser(user);
                this.props.history.push('/');
            } else {
                this.props.history.push('/login');
                this.props.clearUsers();
            }
        })
    }

    render() {
        return this.props.isLoading ? (<Spinner/>) : (
            <Switch>
                <Route exact path="/" component={App}/>
                <Route exact path="/login" component={Login}/>
                <Route exact path="/register" component={Register}/>
            </Switch>
        )
    }
}

const mapStateFromProps = state => ({
    isLoading: state.user.isLoading
});


const RootWithAuth = withRouter(connect(mapStateFromProps, {setUser, clearUsers})(Root));

ReactDOM.render(
    <Provider store={store}>
        <Router>
            <RootWithAuth/>
        </Router>
    </Provider>,
    document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
