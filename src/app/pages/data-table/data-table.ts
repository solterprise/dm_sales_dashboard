import { Component } from '@angular/core';
import { ButtonDirective, ButtonModule } from 'primeng/button';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Ripple, RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { Product, ProductService } from '@/pages/service/product.service';

@Component({
    selector: 'app-data-table',
    imports: [CommonModule, TableModule, ButtonModule, RippleModule],
    templateUrl: './data-table.html',
    styleUrl: './data-table.scss',
    providers: [ProductService]
})
export class DataTable {
    products!: Product[];

    constructor(private productService: ProductService) {}

    ngOnInit() {
        this.productService.getProductsSmall().then((data) => (this.products = data));
    }
}
