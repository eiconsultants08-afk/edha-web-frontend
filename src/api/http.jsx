import axios from 'axios';

function getConfig(token) {
    return {
        headers: { Authorization: `Bearer ${token}` }
    };
};

function handleResponse(response) {
    const statusCode = response.status;
    const { data, message } = response.data;
    // Success if status starts with 2XX
    if (statusCode.toString().startsWith("2")) {
        return {
            success: true,
            data: data,
            message: message
        };
    }
    return {
        success: false,
        data:data,
        message: message
    };
};

function handleError(error) {

    let res;
    if (error.response) {
        // Request made but the server responded with an error
        res = handleResponse(error.response);
    } else if (error.request) {
        // Request made but no response is received from the server.
        res = handleResponse({
            data: {
                status: 500,
                message: "No response received from server."
            }
        });
    } else {
        // Error occured while setting up the request
        res = handleResponse({
            data: {
                status: 400,
                message: "Request send by client is in bad format."
            }
        });
    }
    return res;
};

export async function get(url, token) {
    try {
        if (token) {
            const config = getConfig(token);
            const res = await axios.get(url, config);
            return handleResponse(res);
        } else {
            const res = await axios.get(url);
            return handleResponse(res);
        }
    } catch (error) {
        return handleError(error);
    }
};

export async function post(url, data, token) {
    try {
        if (token) {
            const config = getConfig(token);
            const res = await axios.post(url, data, config);
            return handleResponse(res);
        } else {
            const res = await axios.post(url, data);
            return handleResponse(res);
        }
    } catch (error) {
        return handleError(error);
    }
};

// POST request for file downloads (ZIP, PDF, CSV)
export async function postFile(url, data, token) {
    try {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            },
            responseType: "blob" // 🔥 THIS IS THE KEY
        };

        const res = await axios.post(url, data, config);

        // For file downloads, return raw response
        return {
            success: true,
            data: res.data, // <-- Blob
            headers: res.headers
        };

    } catch (error) {
        console.error("[FILE DOWNLOAD ERROR]", error);
        return {
            success: false,
            message: "File download failed"
        };
    }
}


export async function put(url, data, token) {
  try {
    if (token) {
      const config = getConfig(token);
      const res = await axios.put(url, data, config);
      return handleResponse(res);
    } else {
      const res = await axios.put(url, data);
      return handleResponse(res);
    }
  } catch (error) {
    return handleError(error);
  }
}