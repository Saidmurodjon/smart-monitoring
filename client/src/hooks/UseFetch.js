import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";

const useFetch = () => {
  
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const TOKEN = localStorage.getItem("token");
  const fetchData = async (url, options) => {
    setLoading(true); // Set loading to true before making the request
    try {
      const response = await axios({
        method: options?.method || "get",
        url: process.env.REACT_APP_SERVER_URL + url,
        data: options?.data || null,
        headers: {
          auth: TOKEN,
        },
      });
      setData(response.data);
      setLoading(false); // Set loading to false when the request is done
      if (response.status === options?.status) {
        toast.success(options.successMessage || "Succeessfly", {
          theme: "colored",
        });
      }
    } catch (error) {
      if (error.response.status === 403) {
        window.location.href = "/login";
        return;
      }
      setError(error.response?.data || "An error occurred");
      toast.error(error.response?.data || "An error occurred", {
        theme: "colored",
      });
      setLoading(false); // Set loading to false when there's an error
    }
  };

  return { data, loading, error, fetchData };
};

export default useFetch;
