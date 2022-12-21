import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import TreeNode from '@data/interfaces/tree-node';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { normalizaStringToLowerCase } from '@shared/utils/string-normalization-lower-case';
import lodash from 'lodash';
import { Observable, of } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-generic-tree-node-searcher',
  templateUrl: './generic-tree-node-searcher.component.html',
  styleUrls: ['./generic-tree-node-searcher.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GenericTreeNodeSearcherComponent implements OnInit, OnChanges {
  @Input() originalData: TreeNode[] = null;
  @Output() nodeSelected: EventEmitter<TreeNode> = new EventEmitter();
  public labels = {
    noData: marker('errors.noDataToShow'),
    filter: marker('common.filterAction')
  };
  public treeControl = new NestedTreeControl<TreeNode>((node) => node.children);
  public dataSource = new MatTreeNestedDataSource<TreeNode>();
  //Used to highlight the results
  public searchedWords$: Observable<string[]> = of([]);
  public filterTextSearchControl = new UntypedFormControl();

  constructor() {}

  ngOnInit(): void {
    this.filterTextSearchControl.valueChanges.pipe(untilDestroyed(this)).subscribe((value) => {
      if (value) {
        this.searchedWords$ = of([value]);
      } else {
        this.searchedWords$ = of([]);
      }
      this.filter();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.originalData) {
      this.setTreeDataSource(this.originalData);
    }
  }

  public resetFilter(): void {
    this.filterTextSearchControl.setValue(null);
  }

  public filter(): void {
    const originalData: TreeNode[] = lodash.cloneDeep(this.originalData);
    const filterValue = this.filterTextSearchControl.value ? normalizaStringToLowerCase(this.filterTextSearchControl.value) : '';
    if (filterValue) {
      this.setTreeDataSource(this.filterNodes(filterValue, originalData));
    } else {
      this.setTreeDataSource(originalData);
    }
  }

  public hasChild = (_: number, node: TreeNode) => !!node.children && node.children.length > 0;

  public selectNode(node: TreeNode) {
    this.nodeSelected.emit(node);
    this.resetFilter();
  }

  private setTreeDataSource(data: TreeNode[]): void {
    this.dataSource.data = null;
    this.treeControl.dataNodes = null;
    if (data) {
      this.dataSource.data = data;
      this.treeControl.dataNodes = data;
    }
  }

  private filterNodes(filterValue: string, data: TreeNode[]): TreeNode[] {
    return data.filter((item: TreeNode) => {
      if (normalizaStringToLowerCase(item.name ? item.name : '').indexOf(filterValue) >= 0) {
        return item;
      } else if (item.children?.length) {
        item.children = this.filterNodes(filterValue, item.children);
        if (item.children.length) {
          return item;
        }
      }
      return null;
    });
  }
}
