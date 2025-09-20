import { useForm } from "@inertiajs/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { can } from "@/utils/permissions"
import { toast } from "sonner"

export default function EditInventory({ product }) {
  if (!can("Products edit inventory")) {
    return null
  }

  // form state
  const { data, setData, post, processing, errors } = useForm({
    inventories: product.inventory || [],
  })

  const handleChange = (index, value) => {
    const updated = [...data.inventories]
    updated[index].quantity = parseInt(value, 10) || 0
    setData("inventories", updated)
  }

  const handleSave = (e) => {
    e.preventDefault()
    post(`/products/${product.id}/inventories`, {
      preserveScroll: true,
      onSuccess: () => {
         toast("تم بنجاح", {
          description: "تم تحديث المخزون بنجاح ✅",
          action: {
            label: "OK",
            onClick: () => console.log("Undo"),
          },
        })
      },
    })
  }

  return (
    <form onSubmit={handleSave} className="grid gap-4 max-w-xl mx-auto mt-10 md:grid-cols-2">
      {data.inventories?.map((inv, index) => (
        <Card key={inv.id || index}>
          <CardContent className="flex justify-between items-center p-4">
            <span className="font-medium">{inv.warehouse?.name}</span>
            <Input
              type="number"
              value={inv.quantity}
              onChange={(e) => handleChange(index, e.target.value)}
              className="w-24"
            />
          </CardContent>
        </Card>
      ))}
      
      {errors.inventories && (
        <p className="text-red-500 text-sm">{errors.inventories}</p>
      )}

      <Button type="submit" className="w-full col-span-2" disabled={processing}>
        {processing ? "جاري الحفظ..." : "حفظ التعديلات على المخزون"}
      </Button>
    </form>
  )
}
