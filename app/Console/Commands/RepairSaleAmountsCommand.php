<?php

namespace App\Console\Commands;

use App\Models\Sale;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class RepairSaleAmountsCommand extends Command
{
    protected $signature = 'sales:repair-amounts
                            {--dry-run : Only report what would be changed}
                            {--chunk=200 : How many sales to process at a time}';

    protected $description = 'Recalculate the money columns of the sales (total, other_tax_val, collected, postponed)';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $chunk = max(1, (int) $this->option('chunk'));

        $totals = [
            'total' => 0,
            'other_tax_val' => 0,
            'collected' => 0,
            'postponed' => 0,
        ];

        $collectionSums = DB::table('collections')
            ->select('sale_id', DB::raw('SUM(amount) as amount'))
            ->groupBy('sale_id')
            ->pluck('amount', 'sale_id');

        Sale::query()
            ->orderBy('id')
            ->chunkById($chunk, function ($sales) use (&$totals, $collectionSums, $dryRun) {
                foreach ($sales as $sale) {
                    $changes = [];

                    $subtotal = (float) $sale->subtotal;
                    $discount = (float) ($sale->discount_percentage ?? 0);
                    $afterDiscount = $subtotal - ($subtotal * $discount / 100);

                    $otherTaxVal = round($afterDiscount * (float) ($sale->other_tax ?? 0) / 100, 2);
                    $total = round($afterDiscount - $otherTaxVal + (float) $sale->tax, 2);

                    $collected = round((float) ($collectionSums[$sale->id] ?? 0), 2);
                    $postponed = max(0, round($total - $collected, 2));

                    if (abs((float) $sale->other_tax_val - $otherTaxVal) > 0.005) {
                        $changes['other_tax_val'] = [(float) $sale->other_tax_val, $otherTaxVal];
                        $sale->other_tax_val = $otherTaxVal;
                    }

                    if (abs((float) $sale->total - $total) > 0.005) {
                        $changes['total'] = [(float) $sale->total, $total];
                        $sale->total = $total;
                    }

                    if (abs((float) $sale->collected - $collected) > 0.005) {
                        $changes['collected'] = [(float) $sale->collected, $collected];
                        $sale->collected = $collected;
                    }

                    if (abs((float) $sale->postponed - $postponed) > 0.005) {
                        $changes['postponed'] = [(float) $sale->postponed, $postponed];
                        $sale->postponed = $postponed;
                    }

                    if ($changes === []) {
                        continue;
                    }

                    foreach (array_keys($changes) as $column) {
                        $totals[$column]++;
                    }

                    $this->line(sprintf(
                        '  sale #%s: %s',
                        $sale->id,
                        implode(', ', array_map(
                            fn ($column, $values) => sprintf('%s %s => %s', $column, $values[0], $values[1]),
                            array_keys($changes),
                            $changes
                        ))
                    ));

                    if (! $dryRun) {
                        $sale->save();
                    }
                }
            });

        $this->newLine();
        $this->info(sprintf(
            '%s sales: total=%d, other_tax_val=%d, collected=%d, postponed=%d',
            $dryRun ? 'Would update' : 'Updated',
            $totals['total'],
            $totals['other_tax_val'],
            $totals['collected'],
            $totals['postponed']
        ));

        return self::SUCCESS;
    }
}
