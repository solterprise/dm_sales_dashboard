import { Component, inject } from '@angular/core';
import { UIChart } from 'primeng/chart';
import { debounceTime, Subscription } from 'rxjs';
import { LayoutService } from '@/layout/service/layout.service';
import { Button } from 'primeng/button';
import { Toolbar } from 'primeng/toolbar';
import { Tree } from 'primeng/tree';
import { TreeNode } from 'primeng/api';
import { NodeService } from '@/pages/service/node.service';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
    selector: 'app-data-card',
    imports: [UIChart, Button, Toolbar, Tree, TranslocoPipe],
    templateUrl: './data-card.html',
    styleUrl: './data-card.scss',
    providers: [NodeService]
})
export class DataCard {
    pieData: any;
    pieOptions: any;
    subscription: Subscription;
    treeValue: TreeNode[] = [];
    selectedTreeValue: TreeNode[] = [];
    nodeService = inject(NodeService);
    private router = inject(Router);

    constructor(private layoutService: LayoutService) {
        this.nodeService.getFiles().then((files) => (this.treeValue = files));
        this.subscription = this.layoutService.configUpdate$.pipe(debounceTime(25)).subscribe(() => {
            this.initCharts();
        });
    }

    ngOnInit() {
        this.initCharts();
    }

    initCharts() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');

        this.pieData = {
            labels: ['A', 'B', 'C'],
            datasets: [
                {
                    data: [540, 325, 702],
                    backgroundColor: [documentStyle.getPropertyValue('--p-indigo-500'), documentStyle.getPropertyValue('--p-purple-500'), documentStyle.getPropertyValue('--p-teal-500')],
                    hoverBackgroundColor: [documentStyle.getPropertyValue('--p-indigo-400'), documentStyle.getPropertyValue('--p-purple-400'), documentStyle.getPropertyValue('--p-teal-400')]
                }
            ]
        };

        this.pieOptions = {
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        usePointStyle: true,
                        color: textColor
                    }
                }
            }
        };
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    protected goBack() {
        this.router.navigate(['/']);
    }
}
