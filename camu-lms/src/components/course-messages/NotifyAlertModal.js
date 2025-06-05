import '../../styles/_courseMessageStyle.scss';
import '../../styles/_commonLmsStyle.scss';
import alertimg from "../../assets/images/malert.png";
import Button from '../button/Button';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { updateNotifyPerm } from '../../store/actions/MsgTokenRegAction';

const NotifyAlertModal = (props) => {
    const dispatch = useDispatch()
    const { t } = useTranslation();
    const handleWithoutPermission = () => {
        dispatch(updateNotifyPerm(true))
    }
    return (
        <div hidden={props.showmodal}>
            <div  className="notifypermmodal">
            </div>
            <div className="notifypermmessage">
                <div className="notifypermbody">
                    <img src={alertimg} />
                    <p className="notifypermhead">{t("translate:ENABLE_PUSH_NOTIFICATION")}</p>
                    <div className="notifyperminfo">
                        <p >To use the messaging feature, please allow notifications from your browser.</p>
                    </div>
                    <div className="notifypermbutton">
                        <Button clicked={props.reqPermission} theme="btn-rounded default">
                            <span>{t("translate:ENABLE_PUSH_NOTIFICATION")}</span>
                        </Button>
                    </div>
                    <div className="notifypermbutton">
                        <Button clicked={() => handleWithoutPermission()} theme="btn-rounded default">
                            <span>{t("translate:NO_PUSH_NOTIFICATION")}</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NotifyAlertModal;