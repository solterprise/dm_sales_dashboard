import { Component, inject, OnInit, signal } from '@angular/core';
import { UIChart } from 'primeng/chart';
import { Button } from 'primeng/button';
import { Toolbar } from 'primeng/toolbar';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { WarehouseService } from '@/pages/data-card/warehouse-service';
import { DecimalPipe } from '@angular/common';
import { DatePicker } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { formatDate } from '@/pages/date-utils';
import { MultiSelect } from 'primeng/multiselect';

@Component({
    selector: 'app-data-card',
    imports: [UIChart, Button, Toolbar, TranslocoPipe, DecimalPipe, DatePicker, FormsModule, MultiSelect],
    templateUrl: './data-card.html',
    styleUrl: './data-card.scss',
    providers: []
})
export class DataCard implements OnInit {
    pieData: any;
    pieOptions: any;
    private router = inject(Router);
    private warehouseService = inject(WarehouseService);
    selectedWarehouses: string[] = [];
    payload: any = {
        dateEnd: new Date(),
        warehouse: null
    };
    categories: string[] = [];
    protected warehouses: string[] = [];
    totalAmount = signal<number>(0);

    ngOnInit() {
        this.getData(this.payload);
    }

    getData(payload: any) {
        const payloadToSend = {
            dateEnd: formatDate(payload.dateEnd), // форматируем ОДИН РАЗ
            warehouse: payload.warehouse
        };
        this.warehouseService.getData(payloadToSend).subscribe((data) => {
            this.calculateTotalAmount(data);
            if (this.payload.warehouse === null) {
                this.warehouses = this.getUniqueWarehouses(data);
            }
            const categoryMap = new Map<string, number>();

            data.forEach((item) => {
                categoryMap.set(item.category, (categoryMap.get(item.category) ?? 0) + item.quantity);
            });

            const entries = Array.from(categoryMap.entries()).sort((a, b) => b[1] - a[1]); // по убыванию суммы

            const labels: string[] = [];
            const values: number[] = [];

            entries.forEach(([key, value]) => {
                labels.push(`${key} (${value})`);
                values.push(value);
            });

            this.categories = labels;
            this.initCharts(values);
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
            labels: this.categories,
            datasets: [
                {
                    data: values,
                    backgroundColor: colors,
                    hoverBackgroundColor: hoverColors
                }
            ]
        };

        this.pieOptions = {
            cutout: '10%',
            plugins: {
                legend: {
                    position: 'right',
                    display: true,
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
        this.payload.warehouse = this.selectedWarehouses.length
            ? this.selectedWarehouses.join(',')
            : null;

        this.getData(this.payload);
    }
}
