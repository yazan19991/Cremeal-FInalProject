import axios from 'axios'
// export let apiUrl = 'http://10.0.0.5:7241';
// export let apiUrl = 'http://172.22.176.1:7241';
export let apiUrl = 'https://proj.ruppin.ac.il/cgroup37/test2/tar1';
const ApiManager = axios.create(
    {
        // baseURL: apiUrl+'/api',
        baseURL: apiUrl + '/api',
        responseType: 'json',
        withCredentials: true
    }
)
export default ApiManager;