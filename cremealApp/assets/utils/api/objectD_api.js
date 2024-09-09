import axios from 'axios';
import { apiUrl } from './ApiManager';

export const get_prediction_ingredients = async (data) => {
    const formattedFileUri = data.startsWith('file://') ? data : 'file://' + data;
    try {
        const formData = new FormData();
        formData.append('file', {
            uri: formattedFileUri,
            type: 'image/jpeg', 
            name: 'photo.jpg', 
        });

        const result = await axios.post(
            apiUrl + '/Prediction',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'accept': 'application/json',
                }
            }
        );

        return result;
    } catch (error) {
        if (error.response) {
            console.log("Error response:", error.response);
            if (error.response.status) {
                console.log("Status code:", error.response.status);
            }
            if (error.response.data) {
                console.log("Error response data:", error.response.data);
            }
        } else if (error.request) {
            console.log("Request error:", error.request);
        } else {
            console.log("Network error or other unknown error occurred.");
        }
    }
}
