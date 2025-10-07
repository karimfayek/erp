import { useState } from "react";
import { ChevronsUpDown, Check, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";

export default function CustomerCombobox({ customersList, data, handleCustomerChange }) {
  const [open, setOpen] = useState(false);

  const selected = customersList.find((c) => String(c.id) === String(data.customer_id));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selected?.name || "اختر العميل"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="ابحث عن عميل..." className="text-right" />
          <CommandEmpty>لا يوجد نتائج.</CommandEmpty>

          <CommandGroup>
            {customersList.map((c) => (
              <CommandItem
                key={c.id}
                value={String(c.name)}
                onSelect={() => {
                    const customer = customersList.find((x) => x.name === c.name);
                    handleCustomerChange(customer ? String(customer.id) : "");
                    setOpen(false);
                }}
              >
                 <Check
                className={cn(
                "mr-2 h-4 w-4",
                String(data.customer_id) === String(c.id) ? "opacity-100" : "opacity-0"
                )}
            />
                {c.name}
              </CommandItem>
            ))}

            {/* زر إضافة عميل جديد */}
            <CommandItem
              value="new"
              onSelect={() => {
                handleCustomerChange("new");
                setOpen(false);
              }}
              className="text-blue-600"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> + إضافة عميل جديد
            </CommandItem>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
