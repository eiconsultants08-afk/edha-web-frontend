import { decodeJwt } from "jose";

export function getToken(type) {
    return localStorage.getItem(type);
};

export function storeToken(type, token) {
    return localStorage.setItem(type, token);
};

export function removeToken(type) {
    return localStorage.removeItem(type);
}

export function decode(token) {
    return decodeJwt(token);
};

// Returns true if token is expired else false
export function checkIfTokenIsExpired(token) {
    if (!token) {
        return true;
    }
    const { exp } = decode(token);
    return Date.now() >= exp * 1000;
}

// export function getTokenBody(token) {
//     const { id, role } = decode(token);
//     return { id, role };
// }


export function getTokenBody(token) {

    const { user_id, role, org_id } = decode(token);

    return {
        user_id,
        role,
        org_id
    };
}