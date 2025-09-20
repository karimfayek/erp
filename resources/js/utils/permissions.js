import { usePage } from "@inertiajs/react";

export function can(permission) {

  const { auth } = usePage().props;
  

  if(auth?.user?.role === 'super-admin'){
    return true
  }
  
  return auth?.user?.permissions?.includes(permission);
}
