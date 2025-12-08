import { Component, ElementRef, ViewChild } from '@angular/core';
import { ButtonDirective, ButtonModule } from 'primeng/button';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Ripple, RippleModule } from 'primeng/ripple';
import { Table, TableModule } from 'primeng/table';
import { Product, ProductService } from '@/pages/service/product.service';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';

@Component({
    selector: 'app-data-table',
    imports: [CommonModule, TableModule, ButtonModule, RippleModule, IconField, InputIcon, InputText],
    templateUrl: './data-table.html',
    styleUrl: './data-table.scss',
    providers: [ProductService]
})
export class DataTable {
    products!: Product[];
    @ViewChild('filter') filter!: ElementRef;

    constructor(private productService: ProductService) {}

    ngOnInit() {
        this.productService.getProductsSmall().then((data) => (this.products = data));
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    clear(table: Table) {
        table.clear();
        this.filter.nativeElement.value = '';
    }
}
