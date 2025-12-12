import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { ButtonDirective, ButtonModule } from 'primeng/button';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Ripple, RippleModule } from 'primeng/ripple';
import { Table, TableModule } from 'primeng/table';
import { Product, ProductService } from '@/pages/service/product.service';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { ApiService } from '@/@core/api/api-service';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { Toolbar } from 'primeng/toolbar';

@Component({
    selector: 'app-data-table',
    imports: [CommonModule, TableModule, ButtonModule, RippleModule, IconField, InputIcon, InputText, SelectModule, DatePickerModule, FormsModule, TranslocoPipe, Toolbar],
    templateUrl: './data-table.html',
    styleUrl: './data-table.scss',
    providers: [ProductService, ApiService]
})
export class DataTable implements OnInit {
    products!: any[];
    @ViewChild('filter') filter!: ElementRef;
    private dataService = inject(ApiService);
    payload = {
        ...getCurrentMonthRange(),
        warehouse: null
    };
    loading = false;
    protected warehouses: string[] = [];

    ngOnInit() {
        this.getSales(() => {
            this.warehouses = this.getUniqueWarehouses(this.products);
        });
    }

    private getUniqueWarehouses(products: any[]): string[] {
        return [...new Set(products.map((p) => p.warehouse))];
    }

    protected onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    private getSales(onLoaded?: () => void) {
        this.loading = true;
        this.dataService.getList(this.payload).subscribe((x) => {
            this.products = x!;
            onLoaded?.();
            this.loading = false;
        });
    }

    protected clear(table: Table) {
        table.clear();
        this.filter.nativeElement.value = '';
    }
}
function getCurrentMonthRange() {
    const now = new Date();

    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const format = (d: Date) =>
        d.getFullYear().toString() +
        String(d.getMonth() + 1).padStart(2, '0') +
        String(d.getDate()).padStart(2, '0');

    return {
        dateStart: format(first),
        dateEnd: format(last)
    };


}
