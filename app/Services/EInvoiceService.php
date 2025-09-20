<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class EInvoiceService
{
    public function sendDraft($invoiceJson)
    {
       
        $token = $this->getAccessToken();

        
        $response = Http::withToken($token)
            ->post('https://api.preprod.invoicing.eta.gov.eg/api/v1/documentsubmissions', [
                'documents' => [$invoiceJson]
            ]);

        if ($response->successful()) {
            $data = $response->json();

            return [
                'uuid'   => $data['submissionUUID'] ?? null,
                'status' => 'Draft',
            ];
        }
dd( $response->status());
        return [
            'status' => 'failed',
            'error'  => $response->body(),
        ];
    }

    private function getAccessToken()
    {
        $response = Http::asForm()->post('https://id.preprod.eta.gov.eg/connect/token', [
            'grant_type'    => 'client_credentials',
            'client_id'     => env('ETA_CLIENT_ID'),
            'client_secret' => env('ETA_CLIENT_SECRET'),
            'scope'         => 'InvoicingAPI',
        ]);

        return $response->json()['access_token'] ?? null;
    }
}
