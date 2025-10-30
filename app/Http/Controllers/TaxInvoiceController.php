<?php

namespace App\Http\Controllers;

use App\Models\Sale as Invoice;
use Carbon\Carbon;

class TaxInvoiceController extends Controller
{
    public function generateDraftJsonData($invoiceId)
    {
        $invoice = Invoice::with(['items.product', 'customer'])->findOrFail($invoiceId);
        $fmtAmount = function ($val) {
                // ensure numeric, format to 2 decimals, return as string
                $num = is_null($val) ? 0.0 : (float)$val;
                return number_format($num, 2, '.', '');
            };
            $fmtInt = function ($val) {
                // quantities or integer-like fields as string
                return (string)(is_null($val) ? 0 : (int)$val);
            };
            $fmtRate = function ($val) {
                // rates (percentages) - keep as string, no percent sign
                if (is_null($val)) return '0.00';
                // if rate already integer like 14 -> "14"
                if (is_numeric($val) && intval($val) == floatval($val)) {
                    return (string)intval($val);
                }
                return number_format((float)$val, 2, '.', '');
            };
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
                'postalCode' => '68030',
                'floor' => '1',
                'room' => '123',
                'landmark' => '7660 Melody Trail',
                'additionalInformation' => 'beside Townhall'
            ],
            'type' => $invoice->customer->type ?? 'F', // B = Business, F = Individual
            'id' => $invoice->customer->tax_id ?? '000000000',
            'name' => $invoice->customer->name ?? '',
        ];

        // 3️⃣ حسابات البنود
       $invoiceLines = [];
    $totalSales = 0.0;
    $totalDiscount = 0.0;
    $netAmountBeforeExtra = 0.0;
    $totalTax = 0.0;

    foreach ($invoice->items as $item) {
        $product = $item->product;
        $qty = (float)$item->qty;
        $unitPrice = (float)$item->unit_price;
        $lineSalesTotal = $qty * $unitPrice;
        $lineDiscount = (float)($item->discount ?? 0.0);
        $lineNetTotal = $lineSalesTotal - $lineDiscount;

        $taxRate = isset($product->tax_percentage) ? (float)$product->tax_percentage : 14.0;
        $taxAmount = round(($lineNetTotal * $taxRate) / 100.0, 2);

        // build taxableItems (ordered)
        $taxableItems = [
            [
                'taxType' => 'VAT',
                'amount' => $fmtAmount($taxAmount),
                'subType' => 'T1',
                'rate' => $fmtRate($taxRate),
            ]
        ];

        // build unitValue object (ordered)
        $unitValue = [
            'currencySold' => 'EGP',
            'amountEGP' => $fmtAmount($unitPrice),
            'amountSold' => $fmtAmount($unitPrice),
            'currencyExchangeRate' => '1', // string
        ];

        // assemble line object with deterministic order of keys
        $line = [
            'description' => $product->name ?? '',
            'itemType' => $product->item_type ?? 'EGS',
            'itemCode' => $product->item_code ?? 'EG-0001',
            'unitType' => $product->unit_type ?? 'EA',
            'quantity' => $fmtInt($qty),
            'unitValue' => $unitValue,
            'salesTotal' => $fmtAmount($lineSalesTotal),
            'discount' => [
                'rate' => $fmtAmount($lineSalesTotal > 0 ? ($lineDiscount > 0 ? ($lineDiscount / $lineSalesTotal) * 100.0 : 0.0) : 0.0),
                'amount' => $fmtAmount($lineDiscount),
            ],
            'netTotal' => $fmtAmount($lineNetTotal),
            'taxableItems' => $taxableItems,
        ];

        $invoiceLines[] = $line;

        // accumulate numeric totals as floats for now
        $totalSales += $lineSalesTotal;
        $totalDiscount += $lineDiscount;
        $netAmountBeforeExtra += $lineNetTotal;
        $totalTax += $taxAmount;
    }

    // 4️⃣ extra discount (e.g., other_tax used as percent)
    $extraDiscountPercent = (float)($invoice->other_tax ?? 0.0);
    $extraDiscountAmount = round(($netAmountBeforeExtra * $extraDiscountPercent) / 100.0, 2);
    $netAmountAfterExtra = round($netAmountBeforeExtra - $extraDiscountAmount, 2);

    // 5️⃣ Recalculate tax totals proportionally if extra discount applied
    $taxAdjustmentRatio = $netAmountBeforeExtra > 0 ? ($netAmountAfterExtra / $netAmountBeforeExtra) : 1.0;
    $totalTax = round($totalTax * $taxAdjustmentRatio, 2);

    if (abs($taxAdjustmentRatio - 1.0) > 0.000001) {
        // adjust per-line taxableItems amounts (preserve two decimals and string)
        foreach ($invoiceLines as $i => $line) {
            if (!empty($line['taxableItems']) && is_array($line['taxableItems'])) {
                foreach ($line['taxableItems'] as $j => $tItem) {
                    $orig = (float)($tItem['amount'] ?? 0.0);
                    $adjusted = round($orig * $taxAdjustmentRatio, 2);
                    $invoiceLines[$i]['taxableItems'][$j]['amount'] = $fmtAmount($adjusted);
                }
            }
            // also adjust netTotal if you want netTotal to reflect post-extra discount proportionally
            $origNet = (float)$line['netTotal'];
            $invoiceLines[$i]['netTotal'] = $fmtAmount(round($origNet * $taxAdjustmentRatio, 2));
        }
    }

    // 6️⃣ final totals as formatted strings
    $totalSalesStr = $fmtAmount($totalSales);
    $totalDiscountStr = $fmtAmount($totalDiscount);
    $extraDiscountAmountStr = $fmtAmount($extraDiscountAmount);
    $totalItemsDiscountAmountStr = $totalDiscountStr;
    $netAmountStr = $fmtAmount($netAmountAfterExtra);
    $totalTaxStr = $fmtAmount($totalTax);
    $totalAmount = round($netAmountAfterExtra + $totalTax, 2);
    $totalAmountStr = $fmtAmount($totalAmount);

    // 7️⃣ payment
    $paymentMethod = $invoice->payment_method ?? 'C';
    $payment = [
        'paymentMethod' => $paymentMethod,
    ];
    if ($paymentMethod === 'T') {
        $payment['bankName'] = $invoice->bank_name ?? 'البنك الأهلي المصري';
        $payment['bankAccount'] = $invoice->bank_account ?? '000000';
    }

    // 8️⃣ date formatting to UTC ISO 8601
    $dateIssued = $invoice->issued_at ?? now();
    $dateTimeIssued = \Carbon\Carbon::parse($dateIssued)->setTimezone('UTC')->format('Y-m-d\TH:i:s\Z');

    // 9️⃣ build final invoice JSON with deterministic order of keys
    $invoiceJson = [
        'issuer' => $issuer,
        'receiver' => $receiver,
        'documentType' => $invoice->document_type ?? 'I',
        'documentTypeVersion' => '1.1',
        'invoiceType' => $invoice->invoice_type ?? 'T02',
        'dateTimeIssued' => $dateTimeIssued,
        'taxpayerActivityCode' => $invoice->taxpayer_activity_code ?? '5610',
        'internalID' => $invoice->internal_id ?? null,
        'invoiceLines' => $invoiceLines,
        'totalSales' => $totalSalesStr,
        'totalDiscountAmount' => $totalDiscountStr,
        'extraDiscountAmount' => $extraDiscountAmountStr,
        'totalItemsDiscountAmount' => $totalItemsDiscountAmountStr,
        'netAmount' => $netAmountStr,
        'taxTotals' => [
            [
                'taxType' => 'VAT',
                'amount' => $totalTaxStr,
            ]
        ],
        'totalAmount' => $totalAmountStr,
        'payment' => $payment,
    ];
    
    return $invoiceJson;
    }
protected function signCanonicalData(string $canonicalData)
{
    // عنوان خدمة التوقيع — غيّره لعنوان خادمك
    $signerUrl = env('SIGNER_API_URL', 'http://signer.local/api/sign');

    // البيانات التي تريد إرسالها إلى API التوقيع
    $payload = [
        'canonicalData' => $canonicalData,
        // اختياري: يمكنك تمرير path وpin وthumbprint أو تكوينها في خدمة التوقيع
        'pkcs11LibPath' => env('SIGNER_PKCS11_PATH', 'C:\\\\Windows\\\\System32\\\\eps2003csp11.dll'),
        'tokenPin' => env('SIGNER_TOKEN_PIN', '1234'),
        'certificateThumbprint' => env('SIGNER_CERT_THUMBPRINT', ''),
    ];

    $response = \Illuminate\Support\Facades\Http::post($signerUrl, $payload);

    if ($response->successful()) {
        $data = $response->json();
        return $data['signatureBase64'] ?? null;
    }

    // سجِّل الخطأ وارجع null
    \Log::error('Signer API failed: ' . $response->status() . ' - ' . $response->body());
    return null;
}
    public function sendToETA($id)
    {
        $invoice = Invoice::with(['items.product', 'customer'])->findOrFail($id);

        $invoiceJson = $this->generateDraftJsonData($invoice->id);
        $canonicalData = $this->generateCanonicalDataFromArray($invoiceJson);
        dd( $canonicalData);
        $hashRaw = hash('sha256', $canonicalData, true);
        $hashBase64 = base64_encode($hashRaw); // فقط للمراجعة  
        $signatureBase64 = $this->signCanonicalData($canonicalData);
        if (!$signatureBase64) {
            return back()->with('error', 'فشل الحصول على التوقيع من خدمة التوقيع.');
        }
        $documentToSend = $invoiceJson;
        $documentToSend['canonicalString'] = $canonicalData;
        $documentToSend['signatures'] = [
            [
                'type' => 'I',                       // 'I' = Issuer, 'S' = ServiceProvider
                'value' => $signatureBase64,    
                'signedOn' => now()->toIso8601String(),
                'algorithm' => 'CAdES-BES'
            ]
        ];
        try {
            $etaResponse = app(\App\Services\EInvoiceService::class)->sendDraft($documentToSend);
        } catch (\Throwable $e) {
            dd($e->getMessage());
           \Log::error('ETA send error: ' . $e->getMessage());
            return back()->with('message', 'فشل الاتصال بمنظومة الفاتورة: ' . $e->getMessage());
        }

        // قبول الاستجابة كمصفوفة أو كائن
        $uuid = null;
        $status = null;
        if (is_array($etaResponse)) {
            $uuid = $etaResponse['uuid'] ?? null;
            $status = $etaResponse['status'] ?? null;
        } elseif (is_object($etaResponse)) {
            $uuid = $etaResponse->uuid ?? null;
            $status = $etaResponse->status ?? null;
        }

        $invoice->update([
            'eta_uuid' => $uuid,
            'eta_status' => $status ?? 'failed',
        ]);

        if (is_string($status) && strtolower($status) === 'draft') {
            return back()->with('success', 'تم إرسال الفاتورة للمنظومة كـ Draft ✅');
        }

        return back()->with('error', 'فشل إرسال الفاتورة للمنظومة ❌');
    }
    
protected function serializeValue($value): string
{
    // simple scalar values must be output enclosed in double quotes
    if (is_null($value)) {
        return '""';
    }

    if (is_bool($value)) {
        return '"' . ($value ? 'true' : 'false') . '"';
    }

    if (is_scalar($value)) {
        // IMPORTANT: values must be used "as is"
        // So if you produced numbers as strings earlier, they will remain as in input
        return '"' . (string)$value . '"';
    }

    // arrays/objects handled elsewhere
    return '""';
}

/**
 * Serialize associative object (array) according to ETA algorithm
 * - property names => UPPERCASE, enclosed in quotes
 * - values: recursively serialized; simple types enclosed in quotes
 */
protected function serializeObject(array $assoc): string
{
    $out = '';

    // keep PHP insertion order (ensure we set fields in desired order when building invoice)
    foreach ($assoc as $key => $value) {
        $keyUp = strtoupper((string)$key);
        $out .= '"' . $keyUp . '"';

        // If value is an indexed list (array with numeric keys 0..n), handle as array
        if (is_array($value) && array_keys($value) === range(0, count($value) - 1)) {
            // For JSON arrays: ETA requires prefixing array serialization with the array property name
            // and also each element must be preceded with the array property name.
            // The caller (generateCanonicalData) will take care of prefixing; here just serialize elements.
            foreach ($value as $element) {
                // For each element, as per algo, prepend array name then element serialization
                $out .= '"' . $keyUp . '"';
                if (is_array($element)) {
                    $out .= $this->serializeObject($element);
                } else {
                    $out .= $this->serializeValue($element);
                }
            }
        } else {
            // single object or scalar
            if (is_array($value)) {
                $out .= $this->serializeObject($value);
            } else {
                $out .= $this->serializeValue($value);
            }
        }
    }

    return $out;
}

/**
 * Top-level: produce canonical string for a document array
 * Use this with the exact array you will send to ETA (with numeric amounts prepared as strings).
 */
protected function generateCanonicalDataFromArray(array $doc): string
{
    // Root is the document object itself (not the outer "documents" envelope)
    return $this->serializeObject($doc);
}

}
