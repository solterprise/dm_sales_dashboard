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
import { SALES_FILTER_KEY, SNIPETS } from '@/pages/data-table/snipets';
import { MultiSelect } from 'primeng/multiselect';
import { WarehouseService } from '@/pages/data-card/warehouse-service';
import { SalesService } from '@/pages/data-table/sales-service';

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
    private salesService = inject(SalesService);
    totalAmount = signal<number>(0);
    totalDeliveryAmount = signal<number>(0);
    @ViewChild('warehouseSelect') warehouseSelect!: MultiSelect;
    selectedWarehouses: string[] = [];
    payload: SalesFilterApi = {
        dateStart: getCurrentMonthRange().startDate,
        dateEnd: getCurrentMonthRange().endDate,
        warehouse: null
    };
    loading = false;
    protected warehouses: string[] = [];
    protected readonly snippets = SNIPETS;
    private warehouseService = inject(WarehouseService);
    protected stockQuantity = signal<number>(0);
    private closeTimer: any = null;
    selectedSnippet: string | null = null;

    ngOnInit() {
        this.restoreFiltersFromStorage();
        this.warehouses = this.restoreWarehousesFromStorage();

        if (this.salesService.isLoaded()) {
            this.sales = this.salesService.sales() ?? [];
            this.calculateTotalAmount(this.sales);
            this.calculateTotalDeliveryAmount(this.sales);
            this.getStockQuantity({
                dateEnd: formatDate(this.payload.dateEnd),
                warehouse: this.payload.warehouse
            });

            return;
        }

        this.getSales({
            dateStart: formatDate(this.payload.dateStart),
            dateEnd: formatDate(this.payload.dateEnd),
            warehouse: this.payload.warehouse
        });
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
            this.salesService.sales.set(x);
            this.salesService.isLoaded.set(true);
            this.sales = (x ?? []).sort((a, b) => Number(b.amount) - Number(a.amount));
            if (this.payload.warehouse === null) {
                const uniqueWarehouses = this.getUniqueWarehouses(this.sales);
                this.warehouses = uniqueWarehouses.length ? uniqueWarehouses : this.restoreWarehousesFromStorage();
                if (this.warehouses.length) {
                    localStorage.setItem('warehouses', JSON.stringify(this.warehouses));
                }
            }
            this.calculateTotalAmount(this.sales);
            this.calculateTotalDeliveryAmount(this.sales);
            this.getStockQuantity({
                dateEnd: payloadToSend.dateEnd,
                warehouse: payloadToSend.warehouse
            });
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

        this.selectedWarehouses = [];
        this.selectedSnippet = null;

        localStorage.removeItem(SALES_FILTER_KEY);

        this.snippetSelect?.clear();
        this.getSales();
    }

    applyFilter() {
        const payloadToSend: SalesFilterApi = {
            dateStart: formatDate(this.payload.dateStart),
            dateEnd: formatDate(this.payload.dateEnd),
            warehouse: this.payload.warehouse
        };
        this.saveFiltersToStorage();
        this.getSales(payloadToSend);
    }

    selectSnippet(snippet: string) {
        this.selectedSnippet = snippet;
        const now = new Date();

        switch (snippet) {
            case 'today':
                this.payload.dateStart = now;
                this.payload.dateEnd = now;
                break;
            case 'yesterday': {
                const yesterday = new Date(now);
                yesterday.setDate(now.getDate() - 1);
                this.payload.dateStart = yesterday;
                this.payload.dateEnd = yesterday;
                break;
            }
            case 'month':
                const monthRange = getCurrentMonthRange();
                this.payload.dateStart = monthRange.startDate;
                this.payload.dateEnd = monthRange.endDate;
                break;
            case 'prevMonth': {
                const date = new Date();
                const firstDayPrevMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1);
                const lastDayPrevMonth = new Date(date.getFullYear(), date.getMonth(), 0);

                this.payload.dateStart = firstDayPrevMonth;
                this.payload.dateEnd = lastDayPrevMonth;
                break;
            }
            case 'year':
                const yearRange = getCurrentYearRange();
                this.payload.dateStart = yearRange.startDate;
                this.payload.dateEnd = yearRange.endDate;
                break;
        }
    }

    onWarehouseChange() {
        this.payload.warehouse = this.selectedWarehouses.length ? this.selectedWarehouses.join(',') : null;
        this.saveFiltersToStorage();
        this.restartCloseTimer();
    }

    private restartCloseTimer() {
        if (this.closeTimer) {
            clearTimeout(this.closeTimer);
        }

        this.closeTimer = setTimeout(() => {
            this.warehouseSelect?.hide();
        }, 3000);
    }

    private getStockQuantity(payload: any) {
        this.warehouseService.getData(payload).subscribe((data) => {
            const stockQuantity = data.reduce((sum, item) => sum + Number(item.amount ?? 0), 0);
            this.stockQuantity.set(stockQuantity);
        });
    }

    private saveFiltersToStorage() {
        const data = {
            payload: {
                ...this.payload,
                dateStart: this.payload.dateStart instanceof Date ? this.payload.dateStart.toISOString() : this.payload.dateStart,
                dateEnd: this.payload.dateEnd instanceof Date ? this.payload.dateEnd.toISOString() : this.payload.dateEnd
            },
            selectedWarehouses: this.selectedWarehouses,
            selectedSnippet: this.selectedSnippet
        };

        localStorage.setItem(SALES_FILTER_KEY, JSON.stringify(data));
    }

    private restoreFiltersFromStorage(): boolean {
        const raw = localStorage.getItem(SALES_FILTER_KEY);
        if (!raw) return false;

        try {
            const saved = JSON.parse(raw);

            this.payload = {
                ...saved.payload,
                dateStart: saved.payload.dateStart ? new Date(saved.payload.dateStart) : getCurrentMonthRange().startDate,
                dateEnd: saved.payload.dateEnd ? new Date(saved.payload.dateEnd) : getCurrentMonthRange().endDate
            };

            this.selectedWarehouses = saved.selectedWarehouses ?? [];
            this.payload.warehouse = this.selectedWarehouses.length ? this.selectedWarehouses.join(',') : null;

            this.selectedSnippet = saved.selectedSnippet ?? null;

            return true;
        } catch {
            return false;
        }
    }

    private restoreWarehousesFromStorage(): string[] {
        const raw = localStorage.getItem('warehouses');
        if (!raw) return [];

        try {
            const saved: string[] = JSON.parse(raw);
            return Array.isArray(saved) ? saved : [];
        } catch (e) {
            console.error('Ошибка при чтении складов из localStorage', e);
            return [];
        }
    }
}
