import { useForm, router } from '@inertiajs/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import AppLayout from '@/layouts/app-layout'

export default function RolesIndex({ roles, permissions }) {
  const { data, setData, post, put } = useForm({
    name: '',
    permissions: []
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    post(route('roles.store'))
  }

  const togglePermission = (perm) => {
    setData('permissions',
      data.permissions.includes(perm)
        ? data.permissions.filter(p => p !== perm)
        : [...data.permissions, perm]
    )
  }

  return (
    <AppLayout>

    <div className="grid gap-4">
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Role name"
              value={data.name}
              onChange={e => setData('name', e.target.value)}
              className="border p-2 rounded w-full"
            />

            <div className="grid grid-cols-2 gap-2">
              {permissions.map(perm => (
                <label key={perm.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={data.permissions.includes(perm.id)}
                    onCheckedChange={() => togglePermission(perm.id)}
                  />
                  {perm.name}
                </label>
              ))}
            </div>

            <Button type="submit">Save Role</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="text-lg font-semibold mb-2">Existing Roles</h2>
          {roles.map(role => (
            <div key={role.id} className="border p-2 rounded mb-2">
              <strong>{role.name}</strong> → {role.permissions.map(p => p.name).join(', ')}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
    </AppLayout>
  )
}
