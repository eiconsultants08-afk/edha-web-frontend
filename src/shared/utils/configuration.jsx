export const configuration = {
    dev: {
        baseUrl: "http://localhost:3030/",
        wsBaseUrl: "ws://localhost:3030/ws"
    },
    stg: {
        baseUrl: "https://testapi.weathercastsolutions.com/",
        wsBaseUrl: "wss://testapi.weathercastsolutions.com/ws"
    },
    prod: {
        baseUrl: "https://energybackend.weathercastsolutions.com/",
        wsBaseUrl: "wss://api.weathercastsolutions.com/ws"
    }
};