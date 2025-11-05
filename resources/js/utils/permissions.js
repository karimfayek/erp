import { usePage } from "@inertiajs/react";

export function can(permission) {

  const { auth } = usePage().props;
  

  if(auth?.user?.role === 'super-admin'){
    return true
  }
  console.log(auth?.user?.permissions , 'permsion')
  return auth?.user?.permissions?.includes(permission);
}
