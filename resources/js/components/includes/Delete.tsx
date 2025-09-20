import { useForm } from "@inertiajs/react"

import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { Button } from "../ui/button"
import { toast } from "sonner"
export default function Delete({id , routeName}) {
const { delete: destroy, processing } = useForm()

    const handleDelete = () => {
        destroy(route(routeName, id),{
            preserveScroll: true,
            onSuccess: () => {
                toast.success("تم الحذف بنجاح");
            },
            onError: () => {
                toast.error("حدث خطأ أثناء الحذف");
            }
        })
    }

    return(

         <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" className='hover:bg-red-500'>مسح </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            هذا الإجراء لا يمكن التراجع عنه. سيتم الحذف  بشكل دائم.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete()}
                                                            disabled={processing}
                                                            className="bg-red-600 hover:bg-red-700"
                                                        >
                                                            {processing ? "جارٍ الحذف..." : "تأكيد الحذف"}
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
    )
}