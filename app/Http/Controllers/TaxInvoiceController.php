<?php

namespace App\Http\Controllers;

use App\Models\Sale as Invoice;
use Illuminate\Http\Request;

class TaxInvoiceController extends Controller
{
    public function generateDraftJsonData($invoiceId)
    {
        // 1. نجيب الفاتورة مع البنود والمنتجات
        $invoice = Invoice::with(['items.product', 'customer'])->findOrFail($invoiceId);
       // dd($invoice);
        // 2. تجهيز بيانات البائع (issuer) - ثابتة غالبًا
        $issuer = [
            "address" => [
                "branchID"      => "0",
                "country"       => "EG",
                "governate"     => "Cairo",
                "regionCity"    => "Nasr City",
                "street"        => "Abbas El Akkad",
                "buildingNumber"=> "12",
                "postalCode"    => "11765",
            ],
            "type" => "B", 
            "id"   => "123456789", 
            "name" => "رافكو ",
        ];

        // 3. بيانات العميل (receiver)
        $receiver = [
            "address" => [
                "country"       => $invoice->customer->country ??"EG",
                "governate"     => $invoice->customer->governate ?? "Cairo",
                "regionCity"    => $invoice->customer->city ?? "Nasr City",
                "street"        => $invoice->customer->street ?? "Street 1",
                "buildingNumber"=> $invoice->customer->building_number ?? "1",
            ],
            "type" =>  $invoice->customer->type ?? "F", // Business (لو شخص ممكن يبقى P)
            "id"   => $invoice->customer->tax_id ?? "000000000",
            "name" => $invoice->customer->name,
        ];

        // 4. تجهيز البنود
        $invoiceLines = [];
        $totalSales = 0;
        $totalDiscount = 0;
        $netAmount = 0;
        $totalTax = 0;

        foreach ($invoice->items as $item) {
            $product = $item->product;

            $lineSalesTotal = $item->quantity * $item->unit_price;
            $lineDiscount   = $item->discount ?? 0;
            $lineNetTotal   = $lineSalesTotal - $lineDiscount;

            $taxRate  = $product->tax_percentage ?? 14;
            $taxAmount = ($lineNetTotal * $taxRate) / 100;

            $invoiceLines[] = [
                "description" => $product->name,
                "itemType"    => $product->item_type ?? "EGS",
                "itemCode"    => $product->item_code ?? "EG-0001",
                "unitType"    => $product->unit_type ?? "EA",
                "quantity"    => $item->quantity,
                "unitValue"   => [
                    "currencySold" => "EGP",
                    "amountEGP"    => $item->unit_price
                ],
                "salesTotal"  => $lineSalesTotal,
                "discount"    => [
                    "rate"   => 0,
                    "amount" => $lineDiscount
                ],
                "netTotal"    => $lineNetTotal,
                "taxableItems"=> [
                    [
                        "taxType" => "VAT",
                        "amount"  => $taxAmount,
                        "subType" => "T1",
                        "rate"    => $taxRate
                    ]
                ]
            ];

            $totalSales   += $lineSalesTotal;
            $totalDiscount+= $lineDiscount;
            $netAmount    += $lineNetTotal;
            $totalTax     += $taxAmount;
        }

      
        $invoiceJson = [
            "issuer"                => $issuer,
            "receiver"              => $receiver,
            "documentType"          => "I",
            "documentTypeVersion"   => "1.1",
            "dateTimeIssued"        => $invoice->issued_at->format('Y-m-d\TH:i:s\Z'),
            "taxpayerActivityCode"  => "5610",
            "internalID"            => $invoice->internal_id,
            "invoiceLines"          => $invoiceLines,
            "totalSales"            => $totalSales,
            "totalDiscountAmount"   => $totalDiscount,
            "netAmount"             => $netAmount,
            "taxTotals"             => [
                [
                    "taxType" => "VAT",
                    "amount"  => $totalTax
                ]
            ],
            "totalAmount"           => $netAmount + $totalTax,
            "extraDiscountAmount"   => 0,
            "totalItemsDiscountAmount" => 0
        ];

        return response()->json($invoiceJson, 200, [], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    }
    public function sendToETA($id)
{
    $invoice = Invoice::with(['items.product', 'customer'])->findOrFail($id);

  // dd($invoice->id);
    $invoiceJson = $this->generateDraftJsonData($invoice->id);

   
    $etaResponse = app(\App\Services\EInvoiceService::class)->sendDraft($invoiceJson);

   
    $invoice->update([
        'eta_uuid'   => $etaResponse['uuid'] ?? null,
        'eta_status' => $etaResponse['status'] ?? 'failed',
    ]);

   
    if ($invoice->eta_status === 'Draft') {
        return back()->with('success', 'تم إرسال الفاتورة للمنظومة كـ Draft ✅');
    }
   // dd('here');
    return back()->with('error', 'فشل إرسال الفاتورة للمنظومة ❌');
}

}

