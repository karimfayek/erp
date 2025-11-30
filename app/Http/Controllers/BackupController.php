<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BackupController extends Controller
{
    public function downloadDb()
    {
        $database = config('database.connections.mysql.database');
        $timestamp = now()->format('Y-m-d_H-i-s');
        $filename = "db_backup_{$database}_{$timestamp}.sql.gz";

        try {
            $response = new StreamedResponse(function () use ($database) {
                // نبني SQL على الستاندرد آوت (stream) مباشرة لتفادى تحميل كل شيء بالذاكرة
                echo $this->streamGzippedSql($database);
            }, 200);

            // رؤوس للتنزيل
            $response->headers->set('Content-Type', 'application/gzip');
            $response->headers->set('Content-Disposition', "attachment; filename=\"{$filename}\"");
            // منع التخزين المؤقت إن احتجت
            $response->headers->set('Cache-Control', 'no-store, no-cache');

            return $response;
        } catch (\Throwable $e) {
            // لو فيه خطأ، نرجّع JSON مع كود خطأ
            return response()->json([
                'success' => false,
                'message' => 'Failed to create backup: ' . $e->getMessage(),
            ], 500);
        }
    }

    protected function streamGzippedSql($database)
    {
        // نجهز رأس SQL في الذاكرة الصغيرة ثم نبث البيانات
        $out = "-- DATABASE BACKUP: {$database}\n-- DATE: " . now() . "\n\n";
        $out .= "SET FOREIGN_KEY_CHECKS=0;\n\n";
        echo gzencode($out, 9); // بداية الملف المضغوط

        // جلب الجداول
        $tables = DB::select('SHOW TABLES');
        $tableColumn = "Tables_in_{$database}";

        foreach ($tables as $tableObj) {
            $table = $tableObj->$tableColumn;

            $create = DB::select("SHOW CREATE TABLE `$table`")[0]->{'Create Table'};
            $chunk = "DROP TABLE IF EXISTS `$table`;\n" . $create . ";\n\n";
            echo gzencode($chunk, 9);

            // نغذّي INSERTs صفاً صفاً كي لا نستهلك الذاكرة (يمكن تحسين للـ chunking)
            $rows = DB::table($table)->cursor(); // cursor لتجنب تحميل كامل الجدول في الذاكرة
            $first = true;
            $buffer = '';
            foreach ($rows as $row) {
                $rowArr = array_map(function ($v) {
                    return $v === null ? 'NULL' : DB::getPdo()->quote($v);
                }, (array) $row);
                $line = '(' . implode(',', $rowArr) . ')';
                if ($first) {
                    $buffer .= "INSERT INTO `$table` VALUES\n" . $line;
                    $first = false;
                } else {
                    $buffer .= ",\n" . $line;
                }

                // لو البافر كبير نرسله
                if (strlen($buffer) > 1024 * 200) { // ~200KB
                    echo gzencode($buffer . ";\n\n", 9);
                    $buffer = '';
                    $first = true;
                }
            }
            if (!empty($buffer)) {
                echo gzencode($buffer . ";\n\n", 9);
            }
        }

        echo gzencode("SET FOREIGN_KEY_CHECKS=1;\n", 9);
    }
}
