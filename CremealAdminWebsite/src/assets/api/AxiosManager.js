import axios from 'axios'

// export let apiUrl = 'http://localhost:5241';

export let apiUrl = 'https://proj.ruppin.ac.il/cgroup37/test2/tar1';

const ApiManager = axios.create(
  {
    baseURL: apiUrl + '/api',
    responseType: 'json'
  }
)
export default ApiManager;