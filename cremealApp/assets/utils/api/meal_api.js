
import ApiManager from './ApiManager'; 
export const get_all_meals = async (data) => {
    try {
        const result = await ApiManager("/Meal/Get10Meals", {
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


export const Add_To_Favorite = async (mealId, jwtToken) => {
    try {
        const result = await ApiManager.post('/Meal/AddToFavorite', null, {
            params: { mealId: mealId },
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/plain',
                'Authorization': `Bearer ${jwtToken}`
            }
        });
        console.log("Result:", result.data); // Log the result data for debugging
        return result.data;
    } catch (error) {
        console.log("Error:", error); // Log the entire error object for better diagnostics

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
            console.log("Network error or other unknown error occurred:", error.message); // Handle other types of errors
        }
    }
};

export const Get_Favorite = async (data) => {
    try {

        const result = await ApiManager("/Meal/GetFavorite", {
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

export const Remove_From_Favorite = async (mealId, jwtToken) => {
    try {
        const result = await ApiManager.delete('/Meal/RemoveFromFavorite', {
            params: { mealId: mealId },
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/plain',
                'Authorization': `Bearer ${jwtToken}`
            }
        });
        console.log("Result:", result.data); // Log the result data for debugging
        return result.data;
    } catch (error) {
        console.log("Error:", error); // Log the entire error object for better diagnostics

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
            console.log("Network error or other unknown error occurred:", error.message); // Handle other types of errors
        }
    }
};