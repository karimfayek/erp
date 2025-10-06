<?php

namespace App\Http\Controllers;

use App\Models\Sale as Invoice;

class TaxInvoiceController extends Controller
{
   public function generateDraftJsonData($invoiceId)
{
    $invoice = Invoice::with(['items.product', 'customer'])->findOrFail($invoiceId);

    // 1️⃣ بيانات البائع (ثابتة)
    $issuer = [
        'address' => [
            'branchID' => '0',
            'country' => 'EG',
            'governate' => 'Cairo',
            'regionCity' => 'Nasr City',
            'street' => 'Abbas El Akkad',
            'buildingNumber' => '12',
            'postalCode' => '11765',
        ],
        'type' => 'B',
        'id' => '123456789',
        'name' => 'رافكو',
    ];

    // 2️⃣ بيانات العميل
    $receiver = [
        'address' => [
            'country' => $invoice->customer->country ?? 'EG',
            'governate' => $invoice->customer->governate ?? 'Cairo',
            'regionCity' => $invoice->customer->city ?? 'Nasr City',
            'street' => $invoice->customer->street ?? 'Street 1',
            'buildingNumber' => $invoice->customer->building_number ?? '1',
        ],
        'type' => $invoice->customer->type ?? 'F', // B = Business, F = Individual
        'id' => $invoice->customer->tax_id ?? '000000000',
        'name' => $invoice->customer->name,
    ];

    // 3️⃣ حسابات البنود
    $invoiceLines = [];
    $totalSales = 0;
    $totalDiscount = 0;
    $netAmountBeforeExtra = 0;
    $totalTax = 0;

    foreach ($invoice->items as $item) {
        $product = $item->product;
        $lineSalesTotal = $item->qty * $item->unit_price;
        $lineDiscount = $item->discount ?? 0;
        $lineNetTotal = $lineSalesTotal - $lineDiscount;

        $taxRate = $product->tax_percentage ?? 14;
        $taxAmount = round(($lineNetTotal * $taxRate) / 100, 2);

        $invoiceLines[] = [
            'description' => $product->name,
            'itemType' => $product->item_type ?? 'EGS',
            'itemCode' => $product->item_code ?? 'EG-0001',
            'unitType' => $product->unit_type ?? 'EA',
            'quantity' => $item->qty,
            'unitValue' => [
                'currencySold' => 'EGP',
                'amountEGP' => round($item->unit_price, 2),
                'amountSold' => round($item->unit_price, 2),
                'currencyExchangeRate' => 1,
            ],
            'salesTotal' => round($lineSalesTotal, 2),
            'discount' => [
                'rate' => $lineDiscount > 0 ? round(($lineDiscount / $lineSalesTotal) * 100, 2) : 0,
                'amount' => round($lineDiscount, 2),
            ],
            'netTotal' => round($lineNetTotal, 2),
            'taxableItems' => [
                [
                    'taxType' => 'VAT',
                    'amount' => $taxAmount,
                    'subType' => 'T1',
                    'rate' => $taxRate,
                ],
            ],
        ];

        $totalSales += $lineSalesTotal;
        $totalDiscount += $lineDiscount;
        $netAmountBeforeExtra += $lineNetTotal;
        $totalTax += $taxAmount;
    }

    // 4️⃣ الخصم الإضافي (مثلاً خصم 1% أو 3%)
    $extraDiscountPercent = $invoice->other_tax ?? 0;
    $extraDiscountAmount = round(($netAmountBeforeExtra * $extraDiscountPercent) / 100, 2);
    $netAmountAfterExtra = round($netAmountBeforeExtra - $extraDiscountAmount, 2);

    // 5️⃣ إعادة حساب الضريبة بعد الخصم
    $totalTax = round(($netAmountAfterExtra * 14) / 100, 2);

    // 6️⃣ المبلغ الإجمالي النهائي
    $totalAmount = round($netAmountAfterExtra + $totalTax, 2);

    // 7️⃣ طريقة الدفع
    $paymentMethod = $invoice->payment_method ?? 'C'; // C = Cash
    $payment = [
        'bankName' => $paymentMethod === 'T' ? ($invoice->bank_name ?? 'البنك الأهلي المصري') : null,
        'bankAccount' => $paymentMethod === 'T' ? ($invoice->bank_account ?? '000000') : null,
        'paymentMethod' => $paymentMethod, // C = Cash, T = Transfer, CH = Cheque, CR = Credit
    ];

    // 8️⃣ بناء JSON النهائي
    $invoiceJson = [
        'issuer' => $issuer,
        'receiver' => $receiver,
        'documentType' => $invoice->document_type ?? 'I',
        'documentTypeVersion' => '1.1',
        'invoiceType' => $invoice->invoice_type ?? 'T02',
        'dateTimeIssued' => $invoice->issued_at->format('Y-m-d\TH:i:s\Z'),
        'taxpayerActivityCode' => '5610',
        'internalID' => $invoice->internal_id,
        'invoiceLines' => $invoiceLines,
        'totalSales' => round($totalSales, 2),
        'totalDiscountAmount' => round($totalDiscount, 2),
        'extraDiscountAmount' => $extraDiscountAmount,
        'totalItemsDiscountAmount' => round($totalDiscount, 2),
        'netAmount' => $netAmountAfterExtra,
        'taxTotals' => [
            ['taxType' => 'VAT', 'amount' => $totalTax],
        ],
        'totalAmount' => $totalAmount,
        'payment' => $payment,
    ];

    dd($invoiceJson);
    // return response()->json($invoiceJson, 200, [], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}


    public function sendToETA($id)
    {
        $invoice = Invoice::with(['items.product', 'customer'])->findOrFail($id);

        // dd($invoice->id);
        $invoiceJson = $this->generateDraftJsonData($invoice->id);

        $etaResponse = app(\App\Services\EInvoiceService::class)->sendDraft($invoiceJson);

        $invoice->update([
            'eta_uuid' => $etaResponse['uuid'] ?? null,
            'eta_status' => $etaResponse['status'] ?? 'failed',
        ]);

        if ($invoice->eta_status === 'Draft') {
            return back()->with('success', 'تم إرسال الفاتورة للمنظومة كـ Draft ✅');
        }

        // dd('here');
        return back()->with('error', 'فشل إرسال الفاتورة للمنظومة ❌');
    }
}
