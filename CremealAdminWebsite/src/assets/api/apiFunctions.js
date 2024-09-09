import { useMutation, useQuery } from "@tanstack/react-query";
import api from "/src/assets/api/AxiosManager.js";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useLogin = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credentials) => {
      try {
        const { data } = await api.post('/Admin/AdminSignIn', {
          password: credentials.password,
        });
        sessionStorage.setItem("AdminToken", data);

        return data;
      } catch (error) {
        if (error.response?.status === 401) {
          navigate('/login');
        }
        return null;
      }
    }
  })
};

export const useUsers = (token) => {
  const navigate = useNavigate();

  return useQuery({
    queryKey: ['users', token],
    queryFn: async () => {
      try {
        const { data } = await api.get('/Admin/GetAllUsers', {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: '*/*',
          },
        });
        return data.data;
      } catch (error) {
        if (error.response?.status === 401) {
          navigate('/login');
        }
        toast.error('Error getting users');
      }
    },
    enabled: !!token,
  });
};

export const useStatistics = (token) => {
  const navigate = useNavigate();

  return useQuery({
    queryKey: ['statistics', token],
    queryFn: async () => {
      try {
        const { data } = await api.get('/Admin/GetAllStatistics', {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: '*/*',
          },
        });
        return data.data;
      } catch (error) {
        if (error.response?.status === 401) {
          navigate('/login');
        }
      }
    },
    enabled: !!token,
  });
};

export const useTransactions = (token) => {
  const navigate = useNavigate();

  return useQuery({
    queryKey: ['transactions', token],
    queryFn: async () => {
      try {
        const { data } = await api.get('/Admin/GetAllTransactions', {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: '*/*',
          },
        });
        return data;
      } catch (error) {
        if (error.response?.status === 401) {
          navigate('/login');
        }

      }
    },
    enabled: !!token,
  });
};


export const useReligions = (token) => {
  const navigate = useNavigate();

  return useQuery({
    queryKey: ['religions', token],
    queryFn: async () => {
      try {
        const { data } = await api.get('/Admin/GetAllReligions', {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: '*/*',
          },
        });
        return data.data;
      } catch (error) {
        if (error.response?.status === 401) {
          navigate('/login');
        }
        toast.error('Error getting religions');
      }
    },
    enabled: !!token,
  });
};


export const useAllergics = (token) => {
  const navigate = useNavigate();

  return useQuery({
    queryKey: ['allergics', token],
    queryFn: async () => {
      try {
        const { data } = await api.get('/Admin/GetAllAllergics', {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: '*/*',
          },
        });
        toast.success("loaded")
        return data.data
      } catch (error) {
        if (error.response?.status === 401) {
          navigate('/login');
        }
        if (error.response?.status === 400) {
          toast.error(error.response?.data)
        }
        toast.error('Error getting allergens');
      }
    },
    enabled: !!token,
  });
};


export const useSendEmailToUsers = (token) => {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (emailData) => {
      try {
        const { data } = await api.post('/Admin/SendEmailToUsers', emailData, {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: '*/*',
            'Content-Type': 'application/json',
          },
        });
        return data;
      } catch (error) {
        if (error.response?.status === 401) {
          navigate('/login');
        }

      }
    },

  });

  return {
    ...mutation,
    isLoading: mutation.isLoading,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
};


export const useUpdateUserCoins = (token) => {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async ({ id, coins }) => {
      try {
        const { data } = await api.put('/Admin/UpdateUserCoins', null, {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: '*/*',
            id: id,
            coins: coins,
          },
        });
        toast.success('Updated user successfully');
        return data;
      } catch (error) {
        if (error.response?.status === 401) {
          navigate('/login');
        }
        toast.error("error updating the user")
      }
    },
  });

  return {
    ...mutation,
    isLoading: mutation.isLoading,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
};


export const useRecipes = (token) => {
  const navigate = useNavigate();

  return useQuery({
    queryKey: ['meals', token],
    queryFn: async () => {
      try {
        const response = await api.get("/Admin/GetAllMeals", {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: '*/*',
          },
        });
        return response?.data?.data;
      } catch (error) {
        if (error.response?.status === 401) {
          navigate('/login');
        }
      }
    },
    enabled: !!token,
  });
};

export const useUpdatePlan = (token) => {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (plan) => {
      try {
        const { data } = await api.put(
          '/Admin/UpdatePlan',
          {
            id: plan.id,
            planTitle: plan.name,
            coinsAmount: plan.coins,
            price: plan.price,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              accept: '*/*',
              'Content-Type': 'application/json',
            },
          }
        );

        toast.success(data)
        return data;
      } catch (error) {
        if (error.response?.status === 401) {
          navigate('/login');
        }
        toast.error(error.message)
      }
    },
  });

  return {
    ...mutation,
    isLoading: mutation.isLoading,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
};

export const useGetAllPlans = (token) => {
  const navigate = useNavigate();

  return useQuery({
    queryKey: ['plans', token],
    queryFn: async () => {
      try {
        const { data } = await api.get('/Admin/GetAllPlans', {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: '*/*',
          },
        });
        return data.data;
      } catch (error) {
        if (error.response?.status === 401) {
          navigate('/login');
        }
      }
    },
    staleTime: 60000,
    cacheTime: 300000,
  });
};


export const useInsertNewReligion = (token) => {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (religionTitle) => {
      try {
        const { data } = await api.post(
          '/Admin/InsertNewReligion',
          '',
          {
            headers: {
              accept: '*/*',
              religionTitle: religionTitle,
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success("Inserted successfully")
        return data;
      } catch (error) {
        if (error.response?.status === 401) {
          navigate('/login');
        }
        toast.error("error inserting")
      }
    },
  });

  return {
    ...mutation,
    isLoading: mutation.isLoading,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
};


export const useDeleteReligion = (token) => {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (religionId) => {
      try {
        const { data } = await api.delete(
          '/Admin/DeleteReligion',
          {
            headers: {
              accept: '*/*',
              religionId: religionId,
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success(data)
        return true;
      } catch (error) {
        if (error.response?.status === 401) {
          navigate('/login');
        }
        if (error.response?.status === 500) {
          toast.error(error.response?.data)
        }
        return false;
      }
    },
  });

  return {
    ...mutation,
    isLoading: mutation.isLoading,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
};

export const useInsertNewAllergen = (token) => {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (allergenLabel) => {
      try {
        const { data } = await api.post(
          '/api/Admin/InsertNewAllergen',
          '',
          {
            headers: {
              accept: '*/*',
              allergenLabel: allergenLabel,
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success('Allergen added successfully');
        return data;
      } catch (error) {
        if (error.response?.status === 401) {
          navigate('/login');
        }
        toast.error('Error adding allergen');

      }
    },
  });

  return {
    ...mutation,
    isLoading: mutation.isLoading,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
};

export const useDeleteAllergen = (token) => {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (allergenId) => {
      try {
        const { data } = await api.delete(
          '/api/Admin/DeleteAllergen',
          {
            headers: {
              accept: '*/*',
              allergenId: allergenId,
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success('Allergen deleted successfully');
        return data;
      } catch (error) {
        if (error.response?.status === 401) {
          navigate('/login');
        }
        toast.error('Error deleting allergen');

      }
    },
  });

  return {
    ...mutation,
    isLoading: mutation.isLoading,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
};
