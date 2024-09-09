import ApiManager from "./ApiManager";
import { getAllergenLabels } from "../allergicData";
import { getBeliefLabels } from "../religionData";

export const user_login = async (data) => {
    try {
        const result = await ApiManager("/User/loginUser", {
            method: "POST",
            headers: {
                'Content-Type': "application/json",
                'accept': 'text/plain'
            },
            data: data
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
        return error;
    }

}

//user register
// userIndex == 0 Indicates that the insertion values is not good 
export const user_register = async (data) => {
    try {
        const result = await ApiManager("/User", {
            method: "POST",
            headers: {
                'Content-Type': "application/json",
                'accept': 'text/plain'
            },
            data: data
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
export const user_get_image = async (data) => {
    try {
        const result = await ApiManager("/User/GetImage", {
            method: "GET",
            headers: {
                'Content-Type': "application/json",
                'accept': 'text/plain',
                'Authorization': "bearer " + data.jwtToken
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


export const user_get_meals = async (data) => {
    try {
        const result = await ApiManager("/Meal/GetMealHistory", {
            method: "GET",
            headers: {
                'Content-Type': "application/json",
                'accept': 'text/plain',
                'Authorization': "bearer " + data.jwtToken
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


export const user_generate_meals = async (data, ingredientsIHave) => {
    
    allergicTo = getAllergenLabels(data.allergicTo)
    religion = getBeliefLabels(data.religion)

    try {
        const result = await ApiManager("/Meal", {
            method: "POST",
            headers: {
                'Content-Type': "application/json",
                'accept': '/',
                'Authorization': "bearer " + data.jwtToken
            },
            data: JSON.stringify({
                "ingredints": ingredientsIHave,
                "allerges": allergicTo,
                "relligion": religion
            })
        });
        return result;

    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code that falls out of the range of 2xx
            console.log("Error Response Data:", error.response.data); // Log the response data
            console.log("Error Response Status:", error.response.status); // Log the status code
            console.log("Error Response Headers:", error.response.headers); // Log the headers
        } else if (error.request) {
            // The request was made but no response was received
            console.log("Error Request Data:", error.request); // Log the request data
        } else {
            // Something happened in setting up the request that triggered an Error
            console.log("Error Message:", error.message); // Log the error message
        }
    
        // Log the entire error object for further inspection
        console.log("Axios Error Object:", error.toJSON()); 
    
        // Return the error for further processing
        return error;
    }
}

export const user_login_google = async (data) => {
    try {
        const result = await ApiManager("/User/loginWithGoogle", {
            method: "POST",
            headers: {
                'Content-Type': "application/json",
                'accept': 'text/plain'
            },
            data: data
        });
        return result;
    } catch (error) {
        if (error.response) {
            console.error("Error response:", error.response); // Log the error response if available
            if (error.response.status) {
                console.error("Status code:", error.response.status); // Log the status code if available
            }
            if (error.response.data) {
                console.error("Error response data:", error.response.data); // Log the error response data if available
            }
        } else if (error.request) {
            console.log("Request error:", error.request); // Log the request object if available
        } else {
            console.log("Network error or other unknown error occurred."); // Handle other types of errors

        }
        return error;
    }

}

export const user_upload_image = async (userInfo, uri) => {
    try {
        const formData = new FormData();
        const fileName = `${userInfo.email}.jpg`;

        formData.append('uploadFile', {
            uri: uri,
            type: 'image/jpeg',
            name: fileName,
        });
        console.log(' object: ', formData);

        const response = await ApiManager.put('/User/uploadProfileImage', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${userInfo.jwtToken}`,
            },
        });
        return response;
    } catch (error) {
        if (error.response) {
            console.error("API Error Response:", error.response);
            if (error.response.status) {
                console.error("API Status Code:", error.response.status);
            }
            if (error.response.data) {
                console.error("API Error Response Data:", error.response.data);
            }
        } else if (error.request) {
            console.error("API Request Error:", error.request);
        } else {
            console.error("API Network Error or Other Unknown Error Occurred.");
        }
        return error;
    }
};

export const user_update_profile = async (data, userToken) => {
    try {
        console.log("user_update_profile data: ", data)
        const result = await ApiManager("/User/updateUserImformation", {
            method: "PUT",
            headers: {
                'Content-Type': "application/json",
                'accept': 'text/plain',
                'Authorization': "bearer " + userToken
            },
            data: data
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

export const user_pay_plan = async (data, userToken) => {
    try {
        const result = await ApiManager("/User/PayForPlan", {
            method: "PUT",
            headers: {
                'Content-Type': "application/json",
                'accept': 'text/plain',
                'Authorization': "bearer " + userToken
            },
            data: data
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

export const Get_All_Plans = async (userInfo) => {
    console.log(userInfo)
    try {
        const result = await ApiManager("Admin/GetAllPlans", {
            method: "GET",
            headers: {
                'Content-Type': "application/json",
                'accept': 'text/plain',
                'Authorization': `Bearer ${userInfo.jwtToken}`,
            },
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

export const Get_User_Rligon_And_Alergens = async (userInfo) => {
    try {
        const result = await ApiManager("User/GetUserRligonAndAlergens", {
            method: "GET",
            headers: {
                'Content-Type': "application/json",
                'accept': 'text/plain',
                'Authorization': `Bearer ${userInfo.jwtToken}`,
            },
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