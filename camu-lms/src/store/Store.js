import { createStore, combineReducers, applyMiddleware } from 'redux'
import Thunk from 'redux-thunk'
import dashboardReducer from '../store/reducer/DashboardReducer';
import contentReducer from '../store/reducer/ContentReducer';
import fileUploadReducer from '../store/reducer/FileUploadReducer';
import headerReducer from '../store/reducer/HeaderReducer';
import gradeBookReducer from '../store/reducer/GradeBookReducer';
import scheduleReducer from '../store/reducer/ScheduleReducer';
import settingsReducer from '../store/reducer/SettingsReducer'
import analyticsReducer from '../store/reducer/AnalyticsReducer';
import LoginReducer from '../store/reducer/LoginReducer';
import RubricsReducer from '../store/reducer/RubricsReducer';
import NotificationReducer from '../store/reducer/NotificationReducer';
import ReportsReducer from '../store/reducer/ReportsReducer';
import ChatsReducer from '../store/reducer/ChatsReducer';
import MsgTokenRegReducer from '../store/reducer/MsgTokenRegReducer';
import StaffReducer from '../store/reducer/StaffReducer';
import ParticipantReducer from './reducer/ParticipantReducer';
import ScormFileReducer from './reducer/ScormFileReducer'
import { persistStore, persistReducer } from "redux-persist";
import storage from 'redux-persist/lib/storage'

const rootReducer = combineReducers({
    dashboardReducer,
    contentReducer,
    fileUploadReducer,
    headerReducer,
    scheduleReducer,
    gradeBookReducer,
    settingsReducer,
    analyticsReducer,
    LoginReducer,
    RubricsReducer,
    NotificationReducer,
    ReportsReducer,
    ChatsReducer,
    MsgTokenRegReducer,
    StaffReducer,
    ParticipantReducer,
    ScormFileReducer
})

const persistConfiq = {
    key: "root",
    storage,
    whitelist: []
};

const persistedReducer = persistReducer(persistConfiq, rootReducer);

const store = createStore(persistedReducer, applyMiddleware(Thunk));
const persistor = persistStore(
    store,
    undefined,
    () => { console.log('done') });
export { store, persistor };
