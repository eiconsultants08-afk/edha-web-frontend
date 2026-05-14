export const configuration = {
    dev: {
        baseUrl: "http://localhost:3030/",
        wsBaseUrl: "ws://localhost:3030/ws"
    },
    stg: {
        baseUrl: "https://testapi.edhaaenovations.com/",
        wsBaseUrl: "wss://testapi.edhaaenovations.com/ws"
    },
    prod: {
        baseUrl: "https://biocheq.edhaaenovations.com/",
        wsBaseUrl: "wss://api.edhaaenovations.com/ws"
    }
};