import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { UIChart } from 'primeng/chart';
import { Button, ButtonDirective } from 'primeng/button';
import { Toolbar } from 'primeng/toolbar';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { WarehouseService } from '@/pages/data-card/warehouse-service';
import { DecimalPipe } from '@angular/common';
import { DatePicker } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { formatDate, getCurrentMonthRange } from '@/pages/date-utils';
import { MultiSelect } from 'primeng/multiselect';
import { finalize } from 'rxjs';
import { ProgressSpinner } from 'primeng/progressspinner';
import { ApiService } from '@/@core/api/api-service';

@Component({
    selector: 'app-data-card',
    imports: [UIChart, Button, Toolbar, TranslocoPipe, DecimalPipe, DatePicker, FormsModule, MultiSelect, ButtonDirective, ProgressSpinner],
    templateUrl: './data-card.html',
    styleUrl: './data-card.scss',
    providers: []
})
export class DataCard implements OnInit {
    pieData: any;
    pieOptions: any;
    private router = inject(Router);
    private warehouseService = inject(WarehouseService);
    private dataService = inject(ApiService);
    @ViewChild('warehouseSelect') warehouseSelect!: MultiSelect;

    selectedWarehouses: string[] = [];
    payload: any = {
        dateStart: getCurrentMonthRange().startDate,
        dateEnd: getCurrentMonthRange().endDate,
        warehouse: null
    };
    categories: string[] = [];
    protected warehouses: string[] = [];
    totalAmount = signal<number>(0);
    topN = 10;
    showAllCategories = false;
    displayCategories: string[] = [];
    displayValues: number[] = [];
    isLoading = false;

    ngOnInit() {
        this.getData(this.payload);
    }


    toggleShowAllCategories() {
        this.showAllCategories = !this.showAllCategories;
        this.getData(this.payload);
    }

    getData(payload: any) {
        this.isLoading = true;
        const payloadToSend = {
            dateStart: formatDate(payload.dateStart),
            dateEnd: formatDate(payload.dateEnd),
            warehouse: payload.warehouse
        };
        this.dataService.getList(payloadToSend)
            .pipe(finalize(() => (this.isLoading = false)))
            .subscribe((data) => {
                this.calculateTotalAmount(data);
                if (this.payload.warehouse === null) {
                    this.warehouses = this.getUniqueWarehouses(data);
                }
                const categoryMap = new Map<string, number>();

                data.forEach((item) => {
                    const category =
                        item.category?.trim()
                            ? item.category.trim()
                            : 'No category';

                    const current = categoryMap.get(category) ?? 0;

                    categoryMap.set(
                        category,
                        Math.round(current + Number(item.amount))
                    );
                });
                const entries = Array.from(categoryMap.entries()).sort((a, b) => b[1] - a[1]);


                const labels: string[] = [];
                const values: number[] = [];

                entries.forEach(([key, value]) => {
                    labels.push(key);
                    values.push(value);
                });

                this.categories = labels;

                let displayLabels: string[];
                let displayValues: number[];

                if (!this.showAllCategories) {
                    displayLabels = labels.slice(0, this.topN);
                    displayValues = values.slice(0, this.topN);
                    const othersSum = values.slice(this.topN).reduce((a, b) => a + b, 0);
                    if (othersSum > 0) {
                        displayLabels.push('Other');
                        displayValues.push(othersSum);
                    }
                } else {
                    displayLabels = labels;
                    displayValues = values;
                }

                const totalSum = displayValues.reduce((a, b) => a + b, 0);
                this.displayCategories = displayLabels.map((label, i) => `${label} (${displayValues[i]}) - ${((displayValues[i]/totalSum)*100).toFixed(2)}%`);
                this.displayValues = displayValues;

                this.initCharts(this.displayValues);
            });
    }



    initCharts(values: number[]) {
        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color');
        const colors = this.generateColors(this.categories.length);
        const hoverColors = colors.map((c) => {
            const hslMatch = c.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
            if (!hslMatch) return c;
            const [_, h, s, l] = hslMatch;
            const newLightness = Math.max(20, Number(l) - 10);
            return `hsl(${h}, ${s}%, ${newLightness}%)`;
        });

        this.pieData = {
            labels: this.displayCategories,
            datasets: [
                {
                    data: values,
                    backgroundColor: colors,
                    hoverBackgroundColor: hoverColors
                }
            ]
        };

        this.pieOptions = {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '10%',
            plugins: {
                legend: {
                    position: 'bottom',
                    align: 'start',
                    display: window.innerWidth > 640,
                    labels: {
                        usePointStyle: true,
                        boxWidth: 20,
                        color: textColor
                    }
                }
            }
        };
    }

    protected goBack() {
        this.router.navigate(['/']);
    }

    private generateColors(count: number): string[] {
        const GOLDEN_ANGLE = 137.508;
        return Array.from({ length: count }, (_, i) => {
            const hue = (i * GOLDEN_ANGLE) % 360;
            const saturation = 65 + (i % 5) * 6;
            const lightness = 42 + (i % 4) * 6;
            return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        });
    }

    private calculateTotalAmount(sales: any[]) {
        const total = sales.reduce((sum, item) => sum + Number(item.amount), 0);
        this.totalAmount.set(total);
    }

    private getUniqueWarehouses(products: any[]): string[] {
        return [...new Set(products.map((p) => p.warehouse))];
    }

    applyFilter() {
        this.getData(this.payload);
    }

    onWarehouseChange() {
        this.payload.warehouse = this.selectedWarehouses.length ? this.selectedWarehouses.join(',') : null;

        this.getData(this.payload);
        this.restartCloseTimer();
    }
    private closeTimer: any = null;
    private restartCloseTimer() {
        if (this.closeTimer) {
            clearTimeout(this.closeTimer);
        }

        this.closeTimer = setTimeout(() => {
            this.warehouseSelect?.hide();
        }, 3000);
    }

    protected clear() {
        this.payload = {
            dateStart: getCurrentMonthRange().startDate,
            dateEnd: getCurrentMonthRange().endDate,
            warehouse: null
        };

        this.selectedWarehouses = [];
        this.getData(this.payload);
    }

}

