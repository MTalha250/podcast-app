import axios from "axios";

export const login = async (email: string, password: string) => {
  const { data } = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
    { email, password }
  );
  localStorage.setItem("token", data.token);
  return data;
};

export const register = async (
  name: string,
  email: string,
  password: string
) => {
  const { data } = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
    { name, email, password }
  );
  localStorage.setItem("token", data.token);
  return data;
};

export const logout = () => {
  localStorage.removeItem("token");
  return null;
};

export const loginBack = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    return null;
  }

  const { data } = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/user`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return { user: data, token };
};
