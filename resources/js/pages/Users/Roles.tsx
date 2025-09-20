import { useForm, router } from "@inertiajs/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";

export default function UserRoles({ user, roles }) {
  const { data, setData, put, processing } = useForm({
    role_id: user.role_id || "",
  });

  const submit = () => {
    put(route("users.roles.update", user.id));
  };

  return (
    <Card className="p-4">
      <CardContent>
        <h2 className="text-lg font-bold mb-4">Assign Role to {user.name}</h2>
        <Select value={data.role_id} onValueChange={(val) => setData("role_id", val)}>
          <SelectTrigger>{data.role_id ? roles.find(r => r.id == data.role_id)?.name : "Select role"}</SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button className="mt-4" onClick={submit} disabled={processing}>
          Save
        </Button>
      </CardContent>
    </Card>
  );
}
