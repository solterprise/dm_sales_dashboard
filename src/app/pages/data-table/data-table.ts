import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { RippleModule } from 'primeng/ripple';
import { Table, TableModule } from 'primeng/table';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { ApiService, SaleResponse } from '@/@core/api/api-service';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { Toolbar } from 'primeng/toolbar';
import { getCurrentMonthRange, getCurrentYearRange, formatDate } from '@/pages/date-utils';
import { SalesFilterApi } from '@/entities/sale-filter-api';
import { SNIPETS } from '@/pages/data-table/snipets';
import { MultiSelect } from 'primeng/multiselect';

@Component({
    selector: 'app-data-table',
    imports: [CommonModule, TableModule, ButtonModule, RippleModule, IconField, InputIcon, InputText, SelectModule, DatePickerModule, FormsModule, TranslocoPipe, Toolbar, MultiSelect],
    templateUrl: './data-table.html',
    styleUrl: './data-table.scss',
    providers: [ApiService]
})
export class DataTable implements OnInit {
    sales!: SaleResponse[];
    @ViewChild('filter') filter!: ElementRef;
    @ViewChild('snippetSelect') snippetSelect!: any;
    private dataService = inject(ApiService);
    totalAmount = signal<number>(0);
    totalDeliveryAmount = signal<number>(0);
    selectedWarehouses: string[] = [];
    payload: SalesFilterApi = {
        dateStart: getCurrentMonthRange().startDate,
        dateEnd: getCurrentMonthRange().endDate,
        warehouse: null
    };
    loading = false;
    protected warehouses: string[] = [];
    protected readonly snippets = SNIPETS;

    ngOnInit() {
        this.getSales();
    }

    private getUniqueWarehouses(products: any[]): string[] {
        return [...new Set(products.map((p) => p.warehouse))];
    }

    protected onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    private getSales(payload?: SalesFilterApi) {
        this.loading = true;
        const payloadToSend: SalesFilterApi = payload ?? {
            dateStart: formatDate(this.payload.dateStart),
            dateEnd: formatDate(this.payload.dateEnd),
            warehouse: this.payload.warehouse
        };
        this.dataService.getList(payloadToSend).subscribe((x) => {
            this.sales = x!;
            if (this.payload.warehouse === null) {
                this.warehouses = this.getUniqueWarehouses(this.sales);
            }
            this.calculateTotalAmount(this.sales);
            this.calculateTotalDeliveryAmount(this.sales);
            this.loading = false;
        });
    }

    private calculateTotalAmount(sales: SaleResponse[]) {
        const total = sales.reduce((sum, item) => sum + Number(item.amount), 0);
        this.totalAmount.set(total);
    }

    private calculateTotalDeliveryAmount(sales: SaleResponse[]) {
        const totalDelivery = sales.reduce((sum, item) => sum + Number(item.deliveryQuantity), 0);
        this.totalDeliveryAmount.set(totalDelivery);
    }

    protected clear(table: Table) {
        table.clear();
        this.filter.nativeElement.value = '';
        this.payload = {
            dateStart: getCurrentMonthRange().startDate,
            dateEnd: getCurrentMonthRange().endDate,
            warehouse: null
        };

        // Сброс выбранных складов
        this.selectedWarehouses = [];
        if (this.snippetSelect) this.snippetSelect.clear();
        // Обновляем данные
        this.getSales();
    }

    applyFilter() {
        const payloadToSend: SalesFilterApi = {
            dateStart: formatDate(this.payload.dateStart),
            dateEnd: formatDate(this.payload.dateEnd),
            warehouse: this.payload.warehouse
        };
        this.getSales(payloadToSend);
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

    onWarehouseChange() {
        this.payload.warehouse = this.selectedWarehouses.length
            ? this.selectedWarehouses.join(',')
            : null;

        this.getSales();
    }

}
