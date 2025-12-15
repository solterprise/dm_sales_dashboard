import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CommonModule} from '@angular/common';
import { RippleModule } from 'primeng/ripple';
import { Table, TableModule } from 'primeng/table';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { ApiService, Sale } from '@/@core/api/api-service';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { Toolbar } from 'primeng/toolbar';

@Component({
    selector: 'app-data-table',
    imports: [
        CommonModule,
        TableModule,
        ButtonModule,
        RippleModule,
        IconField,
        InputIcon,
        InputText,
        SelectModule,
        DatePickerModule,
        FormsModule,
        TranslocoPipe,
        Toolbar
    ],
    templateUrl: './data-table.html',
    styleUrl: './data-table.scss',
    providers: [ApiService]
})
export class DataTable implements OnInit {
    sales!: any[];
    @ViewChild('filter') filter!: ElementRef;
    private dataService = inject(ApiService);
    totalAmount = signal('');
    totalDeliveryAmount = signal(0);
    payload = {
        dateStart: getCurrentMonthRange().startDate,
        dateEnd: getCurrentMonthRange().endDate,
        warehouse: null
    };
    loading = false;
    protected warehouses: string[] = [];
    snippets = [
        { labelKey: 'utils.today', value: 'today' },
        { labelKey: 'utils.currentMonth', value: 'month' },
        { labelKey: 'utils.currentYear', value: 'year' }
    ];

    ngOnInit() {
        this.getSales(() => {
            this.warehouses = this.getUniqueWarehouses(this.sales);
        });
    }

    private getUniqueWarehouses(products: any[]): string[] {
        return [...new Set(products.map((p) => p.warehouse))];
    }

    protected onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    private getSales(onLoaded?: () => void, payload?: SalesFilterApi) {
        this.loading = true;
        const payloadToSend: SalesFilterApi = payload ?? {
            dateStart: this.formatDate(this.payload.dateStart),
            dateEnd: this.formatDate(this.payload.dateEnd),
            warehouse: this.payload.warehouse
        };
        this.dataService.getList(payloadToSend).subscribe((x) => {
            this.sales = x!;
            const total = this.sales.reduce((sum, item) => sum + Number(item.amount), 0);
            this.totalAmount.set(total);
            const totalDelivery = this.sales.reduce((sum, item) => sum + Number(item.deliveryQuantity), 0);
            this.totalDeliveryAmount.set(totalDelivery);
            onLoaded?.();
            this.loading = false;
        });
    }

    protected clear(table: Table) {
        table.clear();
        this.filter.nativeElement.value = '';
    }

    applyFilter() {
        const payloadToSend: SalesFilterApi = {
            dateStart: this.formatDate(this.payload.dateStart),
            dateEnd: this.formatDate(this.payload.dateEnd),
            warehouse: this.payload.warehouse
        };
        this.getSales(undefined, payloadToSend);
    }

    private formatDate(d: Date | string | null): string | null {
        if (!d) return null;

        const date = new Date(d);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}${month}${day}`;
    }

    selectSnippet(snippet: string) {
        const now = new Date();

        switch (snippet) {
            case 'today':
                this.payload.dateStart = now;
                this.payload.dateEnd = now;
                break;
            case 'month':
                const monthRange = getCurrentMonthRange();
                this.payload.dateStart = monthRange.startDate;
                this.payload.dateEnd = monthRange.endDate;
                break;
            case 'year':
                const yearRange = getCurrentYearRange();
                this.payload.dateStart = yearRange.startDate;
                this.payload.dateEnd = yearRange.endDate;
                break;
        }

        this.applyFilter();
    }
}

function getCurrentMonthRange(): { startDate: Date; endDate: Date } {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { startDate: first, endDate: last };
}

function getCurrentYearRange(): { startDate: Date; endDate: Date } {
    const now = new Date();
    const first = new Date(now.getFullYear(), 0, 1);
    const last = new Date(now.getFullYear(), 11, 31);
    return { startDate: first, endDate: last };
}

interface SalesFilterApi {
    dateStart: string | null;
    dateEnd: string | null;
    warehouse: string | null;
}
