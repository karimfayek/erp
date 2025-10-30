<?php

namespace App\Services;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;

class EInvoiceService
{
    public function sendDraft($invoiceJson)
    {
        // الحصول على التوكن
        $token = $this->getAccessTokenCached();
        if (!$token) {
            Log::error('EInvoiceService: Unable to obtain access token.');
            return [
                'status' => 'failed',
                'error'  => 'Unable to obtain access token',
            ];
        }

        // 2) تعامل مع الـpayload: اقبل كـ string أو array أو envelope بالفعل
        if (is_string($invoiceJson)) {
            $decoded = json_decode($invoiceJson, true);
            $document = $decoded !== null ? $decoded : $invoiceJson;
        } else {
            $document = $invoiceJson;
        }

        // If caller already passed an envelope { "documents": [ ... ] }, use it as-is
        $payload = null;
        if (is_array($document) && array_key_exists('documents', $document) && is_array($document['documents'])) {
            // Already correctly wrapped
            $payload = $document;
        } else {
            // wrap single document (expected typical case)
            $payload = ['documents' => [ $document ]];
        }

        // 3) prepare URL
        $apiBase = rtrim($this->getApiBase(), '/');
        $submissionsPath = ltrim(env('ETA_SUBMISSIONS_PATH', '/api/v1/documentsubmissions'), '/');
        $url = $apiBase . '/' . $submissionsPath;

        // 4) HTTP client config: timeout + retry policy (simple)
        $timeoutSeconds = env('ETA_HTTP_TIMEOUT', 30);
        $maxRetries = (int)env('ETA_HTTP_RETRIES', 2);

        try {
            // Use a simple retry loop for transient server errors / rate limits
            $attempt = 0;
            $response = null;
            do {
                $attempt++;

                $response = Http::withToken($token)
                    ->accept('application/json')
                    ->timeout($timeoutSeconds)
                    ->post($url, $payload);

                // If success or client error (4xx except 429), break
                if ($response->successful() || ($response->clientError() && $response->status() !== 429)) {
                    break;
                }

                // If rate-limited or server error -> wait and retry (exponential backoff)
                if ($response->serverError() || $response->status() == 429) {
                    $wait = pow(2, $attempt); // 2s, 4s, ...
                    sleep($wait);
                } else {
                    // other cases break
                    break;
                }
            } while ($attempt <= $maxRetries);
        } catch (ConnectionException $ex) {
            Log::error('EInvoiceService connection error: ' . $ex->getMessage());
            return [
                'status' => 'failed',
                'error' => 'Connection error: ' . $ex->getMessage(),
            ];
        } catch (RequestException $ex) {
            Log::error('EInvoiceService request error: ' . $ex->getMessage());
            return [
                'status' => 'failed',
                'error' => 'Request error: ' . $ex->getMessage(),
            ];
        }

        if ($response && $response->successful()) {
            $data = $response->json();

            // Normalize keys for caller (uuid, status)
            return [
                'uuid'   => $data['submissionUUID'] ?? $data['submissionId'] ?? null,
                'status' => $data['status'] ?? 'Draft',
                'raw'    => $data,
            ];
        }

        // Not successful: get useful debug info but avoid logging secrets
        $dbg = [
            'http_status' => $response ? $response->status() : null,
            'body' => $response ? $response->body() : null,
        ];
        Log::warning('EInvoiceService sendDraft failed', $dbg);

        // Try to decode error details if JSON
        $errorBody = null;
        if ($response) {
            $decoded = null;
            try {
                $decoded = $response->json();
            } catch (\Throwable $e) { $decoded = null; }

            if (is_array($decoded)) {
                $errorBody = $decoded;
            } else {
                $errorBody = $response->body();
            }
        }

        return [
            'status' => 'failed',
            'http_status' => $response ? $response->status() : null,
            'error' => $errorBody,
        ];
    }

   private function getAccessTokenCached()
    {
        $cacheKey = 'eta_access_token_' . md5(env('ETA_CLIENT_ID') . '::' . env('ETA_ENV'));

        // return cached if still valid
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        // otherwise fetch
        $idBase = rtrim($this->getIdBase(), '/');
        $url = $idBase . '/connect/token';

        $response = Http::asForm()->post($url, [
            'grant_type'    => 'client_credentials',
            'client_id'     => env('ETA_CLIENT_ID'),
            'client_secret' => env('ETA_CLIENT_SECRET'),
            'scope'         => env('ETA_SCOPE', 'InvoicingAPI'),
        ]);

        if (! $response->successful()) {
            Log::warning('EInvoiceService token request failed', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return null;
        }

        $json = $response->json();
        $accessToken = $json['access_token'] ?? null;
        $expiresIn = isset($json['expires_in']) ? (int)$json['expires_in'] : 300;

        if ($accessToken) {
            // cache slightly less than expiry to be safe
            $ttl = max(60, $expiresIn - 30);
            Cache::put($cacheKey, $accessToken, $ttl);
            return $accessToken;
        }

        return null;
    }

    // Helpers لمرونة الروابط (preprod / production)
    private function getApiBase()
    {
        // يمكنك وضع ETA_API_BASE في .env لإجبار رابط معين
        if ($base = env('ETA_API_BASE')) {
            return $base;
        }

        // افتراضيًا نستخدم بيئة preprod مثل الأصل، لكن يمكن التبديل عبر ETA_ENV
        return env('ETA_ENV', 'preprod') === 'production'
            ? 'https://api.invoicing.eta.gov.eg'
            : 'https://api.preprod.invoicing.eta.gov.eg';
    }

    private function getIdBase()
    {
        if ($base = env('ETA_ID_BASE')) {
            return $base;
        }

        return env('ETA_ENV', 'preprod') === 'production'
            ? 'https://id.eta.gov.eg'
            : 'https://id.preprod.eta.gov.eg';
    }
}
