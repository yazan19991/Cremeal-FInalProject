import ApiManager from "./ApiManager";

export const forget_send_code = async (email) => {
    try {
        const result = await ApiManager("/User/resetPassword/email", {
            method: "Get",
            headers: {
                'accept': 'text/plain'
            },
            params: {
                'email': email
            }
        });
        return result;
    } catch (error) {
        if (error.response) {
            console.log("Error response:", error.response); // Log the error response if available
            if (error.response.status) {
                console.log("Status code:", error.response.status); // Log the status code if available
            }
            if (error.response.data) {
                console.log("Error response data:", error.response.data); // Log the error response data if available
            }
        } else if (error.request) {
            console.log("Request error:", error.request); // Log the request object if available
        } else {
            console.log("Network error or other unknown error occurred."); // Handle other types of errors
        }
    }

}

//user register
// userIndex == 0 Indicates that the insertion values is not good 
export const forget_Verify_code = async (userId, code) => {
    try {
        const result = await ApiManager("/User/verfieCode/userId/code", {
            method: "POST",
            headers: {
                'accept': 'text/plain'
            },
            params: {
                'userId': userId,
                'code': code
            }
        });
        return result;
    } catch (error) {
        if (error.response) {
            console.log("Error response:", error.response); // Log the error response if available
            if (error.response.status) {
                console.log("Status code:", error.response.status); // Log the status code if available
            }
            if (error.response.data) {
                console.log("Error response data:", error.response.data); // Log the error response data if available
            }
        } else if (error.request) {
            console.log("Request error:", error.request); // Log the request object if available
        } else {
            console.log("Network error or other unknown error occurred."); // Handle other types of errors
        }
    }

}
export const forget_Reset_password = async (userId, password) => {
    try {
        const result = await ApiManager("/User/verfieCode/userId/newPassword", {
            method: "PUT",
            headers: {
                'accept': 'text/plain'
            },
            params: {
                'userId': userId,
                'newPassword': password
            }
        });
        return result;
    } catch (error) {
        if (error.response) {
            console.log("Error response:", error.response); // Log the error response if available
            if (error.response.status) {
                console.log("Status code:", error.response.status); // Log the status code if available
            }
            if (error.response.data) {
                console.log("Error response data:", error.response.data); // Log the error response data if available
            }
        } else if (error.request) {
            console.log("Request error:", error.request); // Log the request object if available
        } else {
            console.log("Network error or other unknown error occurred."); // Handle other types of errors
        }
    }

}