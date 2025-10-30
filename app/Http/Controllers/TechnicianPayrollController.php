<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
//use App\Models\TechnicianSalary;
use App\Models\TechnicianDeduction;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TechnicianPayrollController extends Controller
{
    // صفحة الحساب: تعرض اختيار من-إلى (القيمة الافتراضية: من قبل 7 أيام حتى اليوم) + قائمة الفنيين
    public function calcIndex(Request $request)
    {
        // الافتراض: نضع الافتراضي من (today - 7 days) إلى (today)
        // قلت إنك أحببت "بعد أسبوع من اليوم إلى أسبوع هذا" -> نفهمها: الفترة الافتراضية هي آخر 7 أيام (من تاريخ اليوم - 7 أيام) حتى تاريخ اليوم.
        // لماذا هذا الافتراض؟ لأنه يعطي نافذة أسبوعية شاملة (week-to-date) وهي شائعة في تقارير الرواتب الأسبوعية.
        $defaultEnd = Carbon::now()->endOfDay();
        $defaultStart = Carbon::now()->subDays(7)->startOfDay();

        $start = $request->input('start') ? Carbon::parse($request->input('start'))->startOfDay() : $defaultStart;
        $end = $request->input('end') ? Carbon::parse($request->input('end'))->endOfDay() : $defaultEnd;

        // جلب الفنيين — عدّل شرط الفلترة حسب مشروعك (role, flag, etc.)
        $technicians = User::where('type','technician')->select('id','name','email','salary')->get();

        // جلب المرتبات الأساسية الحالية
        $salaries = $technicians->mapWithKeys(function($t) {
            return [$t->id => (object)['base_salary' => $t->salary]];
        });

        // جلب مجموع خصومات لكل فني داخل الفترة (يمكن تجاهل الفترة لو تريد كل الخصومات)
        $deductions = TechnicianDeduction::whereBetween('date', [$start->toDateString(), $end->toDateString()])
                    ->whereIn('technician_id', $technicians->pluck('id')->toArray())
                    ->select('technician_id', DB::raw('SUM(amount) as total_deductions'))
                    ->groupBy('technician_id')
                    ->get()->keyBy('technician_id');

        // لا نحسب العمولات هنا بالكامل — الحساب التفصيلي يتم في compute (أو نعيد حسابًا تقريبيًا هنا)
        // لكن سنعيد بيانات أساسية للعرض
        $data = $technicians->map(function($t) use ($salaries, $deductions) {
            return [
                'id' => $t->id,
                'name' => $t->name,
                'email' => $t->email,
                'base_salary' => $salaries->has($t->id) ? (float)$salaries->get($t->id)->base_salary : 0.0,
                'deductions' => $deductions->has($t->id) ? (float)$deductions->get($t->id)->total_deductions : 0.0,
            ];
        });

        return Inertia::render('Payroll/Calc', [
            'technicians' => $data,
            'period' => [
                'start' => $start->toDateString(),
                'end' => $end->toDateString(),
            ],
        ]);
    }

    // POST: حساب العمولات وارجاع النتائج (يمكن استخدامه عبر fetch/AJAX من الواجهة)
    public function calcCompute(Request $request)
    {
        $request->validate([
            'start' => 'required|date',
            'end' => 'required|date',
            'technician_ids' => 'nullable|array',
            'technician_ids.*' => 'integer|exists:users,id',
        ]);

        $start = Carbon::parse($request->start)->startOfDay();
        $end = Carbon::parse($request->end)->endOfDay();
        $techIds = $request->technician_ids ?? [];

        // جلب الفنيين المطلوبين (أو كل الفنيين)
        $techQuery = User::where('type','technician');
        if (!empty($techIds)) $techQuery->whereIn('id', $techIds);
        $technicians = $techQuery->select('id','name', 'salary')->get();

        // حساب العمولات: قاعدة البيانات عندك اسم جدول الفواتير sales، والعمولة تحسب من (subtotal - expenses)
        // نبحث في جدول invoice_technicians الذي يشير إلى sales.id عن الحقول الخاصة بكل فني في الفترة المحددة
        $commissions = DB::table('invoice_technicians')
            ->join('sales', 'invoice_technicians.invoice_id', '=', 'sales.id')
            ->select(
                'invoice_technicians.technician_id',
                DB::raw('SUM(COALESCE(invoice_technicians.commission_amount,
                    ((sales.subtotal - COALESCE(sales.expenses,0)) * invoice_technicians.commission_percent / 100)
                )) as total_commission'),
                DB::raw('GROUP_CONCAT(sales.id) as invoice_ids')
            )
            ->whereBetween('sales.date', [$start->toDateString(), $end->toDateString()])
            ->groupBy('invoice_technicians.technician_id');

        if (!empty($techIds)) $commissions->whereIn('invoice_technicians.technician_id', $techIds);

        $commissions = $commissions->get()->keyBy('technician_id');

        // جلب الخصومات داخل الفترة لكل فني (أو جلب من جدول الخصومات العام)
        $deductions = TechnicianDeduction::whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->when(!empty($techIds), fn($q) => $q->whereIn('technician_id', $techIds))
            ->select('technician_id', DB::raw('SUM(amount) as total_deductions'))
            ->groupBy('technician_id')
            ->get()->keyBy('technician_id');

        // جلب مرتبات أساسية
        $salaries = $technicians->mapWithKeys(function($t) {
            //dd($t);
            return [$t->id => (object)['base_salary' => $t->salary]];
        });
       // dd($salaries);

        // تجميع النتائج
        $result = $technicians->map(function($t) use ($commissions, $deductions, $salaries) {
            $commRow = $commissions->get($t->id);
            $dedRow = $deductions->get($t->id);
            $salRow = $salaries->get($t->id);

            $total_commission = $commRow ? (float)$commRow->total_commission : 0.0;
            $total_deductions = $dedRow ? (float)$dedRow->total_deductions : 0.0;
            $base_salary = $salRow ? (float)$salRow->base_salary : 0.0;
            $invoice_ids = $commRow ? explode(',', $commRow->invoice_ids) : [];

            $final = round($base_salary + $total_commission - $total_deductions, 2);

            return [
                'id' => $t->id,
                'name' => $t->name,
                'base_salary' => $base_salary,
                'total_commission' => $total_commission,
                'total_deductions' => $total_deductions,
                'final_salary' => $final,
                'invoice_ids' => $invoice_ids,
            ];
        });

        return response()->json([
            'period' => ['start' => $start->toDateString(), 'end' => $end->toDateString()],
            'results' => $result,
        ]);
    }

    // صفحة تعديل المرتب الأساسي (بدون تواريخ)
    public function salariesIndex()
    {
        $technicians = User::where('type','technician')->select('id','name','salary')->get();
        $salaries = $technicians->mapWithKeys(function($t) {
            return [$t->id => (object)['base_salary' => $t->salary]];
        });

        $data = $technicians->map(fn($t) => [
            'id' => $t->id,
            'name' => $t->name,
            'base_salary' => $salaries->has($t->id) ? (float)$salaries->get($t->id)->base_salary : 0.0,
        ]);

        return Inertia::render('Payroll/Salaries', ['technicians' => $data]);
    }

 
    

    // صفحة عرض/إضافة خصومات
    public function deductionsIndex()
    {
        $technicians = User::where('type','technician')->select('id','name','salary')->get();
        $deductions = TechnicianDeduction::with('technician')->orderBy('date','desc')->paginate(30);

        return Inertia::render('Payroll/Deductions', [
            'technicians' => $technicians,
            'deductions' => $deductions,
        ]);
    }

    public function deductionsStore(Request $request)
    {
        $request->validate([
            'technician_id' => 'required|integer|exists:users,id',
            'amount' => 'required|numeric',
            'reason' => 'nullable|string',
            'date' => 'nullable|date',
        ]);

        TechnicianDeduction::create([
            'technician_id' => $request->technician_id,
            'amount' => $request->amount,
            'reason' => $request->reason,
            'date' => $request->date ? $request->date : now()->toDateString(),
            'created_by' => auth()->id(),
        ]);

        return redirect()->back()->with('success','تم إضافة خصم');
    }
    public function deductionsDestroy(TechnicianDeduction $deduction)
    {
        $deduction->delete();
        return redirect()->back()->with('success','تم حذف الخصم');
    }
}
