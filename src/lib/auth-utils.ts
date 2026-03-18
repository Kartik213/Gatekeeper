import { authClient } from "./auth-client";

export const logout = async () => {
  try {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/login";
        },
      },
    });
  } catch (error) {
    console.error("Logout failed:", error);
    window.location.href = "/login";
  }
};
