import { useForm } from "@inertiajs/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default function UserPermissions({ user, permissions }) {
  const { data, setData, put, processing } = useForm({
    permissions: user.permissions?.map((p) => p.id) || [],
  });

  const togglePermission = (id) => {
    if (data.permissions?.includes(id)) {
      setData("permissions", data.permissions?.filter((p) => p !== id));
    } else {
      setData("permissions", [...data.permissions, id]);
    }
  };

  const submit = () => {
    put(route("users.permissions.update", user.id));
  };

  return (
    <Card className="p-4">
      <CardContent>
        <h2 className="text-lg font-bold mb-4">Custom Permissions for {user.name}</h2>
        <div className="grid grid-cols-2 gap-2">
          {permissions?.map((perm) => (
            <label key={perm.id} className="flex items-center space-x-2">
              <Checkbox
                checked={data.permissions?.includes(perm.id)}
                onCheckedChange={() => togglePermission(perm.id)}
              />
              <span>{perm.name_ar}</span>
            </label>
          ))}
        </div>
        <Button className="mt-4" onClick={submit} disabled={processing}>
          Save
        </Button>
      </CardContent>
    </Card>
  );
}
