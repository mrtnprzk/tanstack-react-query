import { useQuery } from "@tanstack/react-query";

export function useUserData(userId) {
  if (!userId) return null;

  const usersData = useQuery(
    ["users", userId],
    ({ signal }) => fetch(`/api/users/${userId}`, { signal }).then((res) => res.json()),
    { staleTime: 1000 * 60 * 5 }
  );

  return usersData;
}
