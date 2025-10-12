import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import UserRoles from "../Users/Roles.tsx"
import RolePermissions from "../Roles/RolePermissions"
import UserPermissions from "../Users/Permissions"
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout.js";

export default function AccessControl({ users, roles, permissions }) {
  const [selectedUser, setSelectedUser] = useState(null);
const [userPermissions , setUserPermissions] = useState(permissions)

  return (
    <AppLayout>

    <div className="space-y-6">
      {/* قائمة كل اليوزرز */}
      <Card className="p-4">
        <CardContent>
          <h2 className="text-lg font-bold mb-4">Users</h2>
          <ul className="divide-y divide-gray-200">
            {users.map((u) => (
              <li
                key={u.id}
                className={`p-2 cursor-pointer hover:bg-gray-100 ${
                  selectedUser?.id === u.id ? "bg-gray-200 font-bold" : ""
                }`}
                onClick={() => setSelectedUser(u)}
              >
                {u.name} <span className="text-sm text-gray-500">({u.email})</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* التحكم في اليوزر المختار */}
      {selectedUser && (
        <div className="space-y-6">
         {/*  <UserRoles user={selectedUser} roles={roles} />
          <RolePermissions role={selectedUser.roles[0]} permissions={permissions} /> */}
          <UserPermissions user={selectedUser} permissions={permissions} />
        </div>
      )}
    </div>
    </AppLayout>
  );
}