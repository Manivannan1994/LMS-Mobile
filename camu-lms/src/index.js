import "core-js/stable";
import React from "react";
// import { createRoot } from 'react-dom/client';
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "bootstrap";
import "bootstrap/dist/css/bootstrap.css";
import "./lang";
import "../node_modules/font-awesome/css/font-awesome.min.css";
import { Provider } from "react-redux";
// import { PersistGate } from "redux-persist/integration/react";
import {store} from './store/Store'

// const rootReducer = combineReducers({
//   dashboardReducer,
//   contentReducer,
//   fileUploadReducer,
//   headerReducer
// })

// const persistConfiq = {
//   key: "root",
//   storage: window.localStorage,
//   whitelist: ['contentReducer']
// };

// const persistedReducer = persistReducer(persistConfiq, rootReducer);

// const store = createStore(persistedReducer, applyMiddleware(Thunk));
// const persistor = persistStore(
//   store,
//   undefined,
//   () => { console.log('done') });
// export { store, persistor };
ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      {/* <PersistGate loading={null} persistor={persistor}> */}
      <App />
      {/* </PersistGate> */}
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

