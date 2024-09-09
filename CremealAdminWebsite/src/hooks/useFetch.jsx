import { useRef, useState } from "react";
import axios from "axios";

const useFetch = (baseURL) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  const abortControllerRef = useRef(null);

  const fetchData = async (router, method, body, headers, query) => {
    const abortController = new AbortController();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = abortController;
    try {
      const axiosConfig = {
        signal: abortControllerRef.current.signal,
        method: method,
        url: `${baseURL}/${router}`,
        params: query,
        headers: {
          "Content-Type": "application/json", // Assuming JSON
          ...headers,
        },
        data: body ? JSON.stringify(body) : null,
      };

      const res = await axios(axiosConfig);

      if (res.status >= 200 && res.status < 300) {
        return {
          status: res.status,
          message: res.data,
        };
      } else {
        return `HTTP Response Code: ${res.status}`;
      }
    } catch (e) {
      if (axios.isCancel(e)) {
        return null;
      }
      if (e.response) {
        return {
          status: e.response.status,
          message: e.response.data,
        };
      } else {
        return {
          status: null,
          message: "An error occurred while processing the request.",
          data: null,
        };
      }
    }
  };

  return { fetchData };
};

export default useFetch;
