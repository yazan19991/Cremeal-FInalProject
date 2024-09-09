import { ALERT_TYPE, Toast ,Dialog} from "react-native-alert-notification";
export function Toasterror(title, message) {
    Toast.show({
        type: ALERT_TYPE.DANGER,
        title: title,
        textBody: message,
    })
}
export function Toastsuccess(title, message) {
    Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: title,
        textBody: message,
    })
}
export function Toastwarning(title, message) {
    Toast.show({
        type: ALERT_TYPE.WARNING,
        title: title,
        textBody: message,
    })
}

export function DialogErrorButton(title, message,button,onPressButton,onHide){
    Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: title,
        textBody: message,
        button: button,
        onPressButton:onPressButton,
        onHide:onHide
        
    })
}
export function DialogwarningButton(title, message,button,onPressButton,onHide){
    Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: title,
        textBody: message,
        button: button,
        onPressButton:onPressButton,
        onHide:onHide
    })
}
export function ToastwarningPress(title, message,onPress) {
    Toast.show({
        type: ALERT_TYPE.WARNING,
        title: title,
        textBody: message,
        onPress:onPress
    })
}