import { Button } from "@/components/ui/button"
import { can } from "@/utils/permissions"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"

export default function DatePicker({ date, setDate }: { date: Date | null, setDate: (date: Date) => void }) {
    const selectedDate = date ? new Date(date) : null
    if (!can('invoices.collections')) return null;
    return (
        <div className="w-full">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-10 justify-start text-left font-normal"
                    >
                        {selectedDate
                            ? format(selectedDate, "yyyy-MM-dd")
                            : "اختر تاريخ التحصيل"}
                    </Button>
                </PopoverTrigger>

                <PopoverContent
                    className="w-auto p-0"
                    align="start"
                >
                    <Calendar
                        className="w-[300px]"
                        mode="single"
                        selected={selectedDate}
                        onSelect={(d) => setDate(d)}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}
