import { useForm, router } from '@inertiajs/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import AppLayout from '@/layouts/app-layout'

export default function UserRoles({ users, roles }) {
  const { data, setData, put } = useForm({
    userId: null,
    role_id: null,
  })

 const handleSubmit = (e) => {
    e.preventDefault()
    if (!data.userId || !data.role_id) return
    put(route('users.roles.update', data.userId))
  }

  const toggleRole = (roleId) => {
    setData('roles',
      data.roles.includes(roleId)
        ? data.roles.filter(r => r !== roleId)
        : [...data.roles, roleId]
    )
  }

  const selectUser = (user) => {
    setData({
      userId: user.id,
      role_id: user?.roles[0]?.id
    })
  }

  return (
    <AppLayout>

    <div className="grid gap-6">
      {/* قائمة المستخدمين */}
      <Card>
        <CardContent className="space-y-2">
          <h2 className="font-semibold">Users</h2>
          {users.map(user => (
            <div
              key={user.id}
              onClick={() => selectUser(user)}
              className={`p-2 rounded cursor-pointer ${data.userId === user.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
            >
              {user.name} ({user.email})
            </div>
          ))}
        </CardContent>
      </Card>

      {/* اختيار الأدوار للمستخدم المحدد */}
      {data.userId && (
        <Card>
          <CardContent>
            <h2 className="font-semibold mb-3">Assign Roles</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
        {roles.map(role => (
          <label key={role.id} className="flex items-center gap-2">
            <input
              type="radio"
              name="role"
              value={role.id}
              checked={data.role_id === role.id}
              onChange={() => setData('role_id', role.id)}
            />
            {role.name}
          </label>
        ))}
      </div>
              <Button type="submit">Save Roles</Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
    </AppLayout>
  )
}
