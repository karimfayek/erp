import * as React from "react"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"

export function ProductCombobox({ products, selectedId, onSelect }) {
  const [open, setOpen] = React.useState(false)
  const selectedProduct = products.find((p) => String(p.id) === String(selectedId))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[250px] justify-between"
        >
          {selectedProduct
            ? `${selectedProduct.name} (${selectedProduct.internal_code})`
            : "اختر المنتج"}
          <ChevronsUpDown className="opacity-50 h-4 w-4 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0">
        <Command>
          <CommandInput placeholder="ابحث عن المنتج..." className="h-9" />
          <CommandList>
            <CommandEmpty>لا يوجد منتجات مطابقة.</CommandEmpty>
            <CommandGroup>
              {products.map((p) => (
                <CommandItem
                  key={p.id}
                  value={`${p.name} ${p.internal_code} ${p.brand_id}`} // 👈 يساعد البحث
                  onSelect={() => {
                    onSelect(p.id) // نرجع الـ ID فقط
                    setOpen(false)
                  }}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-xs text-gray-500">
                      كود: {p.internal_code} — براند: {p.brand_id}
                    </span>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      String(selectedId) === String(p.id)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
