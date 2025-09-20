import { usePage } from "@inertiajs/react";

export function useAuth() {
  const { auth } = usePage().props;

  const can = (permission: string) => {
    return auth?.user?.permissions?.includes(permission);
  };

  const hasRole = (role: string) => {
    return auth?.user?.role === role;
  };

  return { user: auth?.user, can, hasRole };
}
