import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { toast } from "sonner";

export function useGoogleAuth(onSuccess) {
  const login = useGoogleLogin({
    onSuccess: (res) => GetUserProfile(res),
    onError: (error) => {
      console.log(error);
      toast("Failed to sign in with Google");
    },
  });

  const GetUserProfile = (tokenInfo) => {
    axios
      .get(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo.access_token}`,
        {
          headers: {
            Authorization: `Bearer ${tokenInfo.access_token}`,
            Accept: "application/json",
          },
        }
      )
      .then((resp) => {
        localStorage.setItem("user", JSON.stringify(resp.data));
        if (onSuccess) onSuccess();
      })
      .catch((error) => {
        console.error("Error fetching user profile: ", error);
        toast("Failed to fetch user profile");
      });
  };

  return login;
}
