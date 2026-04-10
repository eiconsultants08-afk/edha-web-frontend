import { toast } from "react-toastify";
import { getAuthToken, getUserProfile } from "../../api/api";
import { getTokenBody } from "../../api/token";

export async function updateTokenAndUserDetails(updateAuth, updateUser, isLogin = false) {

    const token = await getAuthToken();

    if (token.isLoginRequired) {
        console.log("Login required. Token expired or missing.");
        return false;
    }

    const body = getTokenBody(token.token);

    updateAuth(body);

    const { success, message, data } = await getUserProfile(body.user_id);

    if (success) {

        updateUser(data);

        if (isLogin) {
            notifyUser('success', 'Login Successful', 'top-right', "2px 0 0 40px");
        }

    } else {

        updateUser({});

        if (isLogin) {
            notifyUser('error', message);
        }
    }

    return true;
}


export function notifyUser(type, message, position, margin = "0 0 0 0") {
    let config = {
        position: position,
        style: {
            width: '260px',
            minHeight: '5px',
            margin: margin
        },
    };
    if (type === 'success') {
        toast.success(message, config);
    } else if (type === 'error') {
        toast.error(message, config);
    }
};
