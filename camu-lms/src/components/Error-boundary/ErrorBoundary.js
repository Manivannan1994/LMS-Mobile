import React, { Component } from 'react';
import HTTPService from '../../utils/http-util';
import i18next from "i18next";

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
        }
    }

    // Update state so the next render will show the fallback UI.

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    // You can also log the error 

    componentDidCatch(error, errorInfo) {

        let oReq = {
            error: error.toString(),
            errorInfo: errorInfo
        }
        HTTPService.post('/lms/save-errors', oReq, null, (err, response) => {
            if (response && response.data) {
                console.log('success');
            } else {
                console.log(err);
            }
        });
    }
    render() {
        if (this.state.hasError) {
            return <h1>{i18next.t('translate:ERR_MSG')}</h1>
        }
        return this.props.children;
    }
}

export default ErrorBoundary;