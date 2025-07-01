import { useEffect } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";

export const useUserSync = () => {
  const { getToken, userId } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    const syncUser = async () => {
      try {
        const token = await getToken();
        await axios.post(
          "http://localhost:4000/api/user/sync",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("✅ User synced to backend");
      } catch (error) {
        console.error("❌ Failed to sync user:", error.message);
      }
    };

    const setRoleIfMissing = async () => {
      const role = user?.publicMetadata?.role;
      if (!role && role !== "admin") {
        try {
          const token = await getToken();
          await axios.post(
            "http://localhost:4000/api/user/set-role-premium",
            {
              userId,
              role: "user",
              isPremium: false,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          console.log("✅ Default role set to 'user'");
        } catch (error) {
          console.error("❌ Failed to set role:", error.message);
        }
      }
    };

    if (userId && user) {
      syncUser();
      setRoleIfMissing();
    }
  }, [userId, user]);
};
