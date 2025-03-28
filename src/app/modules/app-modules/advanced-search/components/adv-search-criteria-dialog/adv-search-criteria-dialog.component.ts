import { Component, OnInit, ViewChild } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import TreeNode from '@data/interfaces/tree-node';
import { AdvancedSearchItem } from '@data/models/adv-search/adv-search-dto';
import AdvancedSearchOptionsDTO from '@data/models/adv-search/adv-search-options-dto';
import AdvSearchVariableDTO from '@data/models/adv-search/adv-search-variable-dto';
import CardColumnTabItemDTO from '@data/models/cards/card-column-tab-item-dto';
// eslint-disable-next-line max-len
import { GenericTreeNodeSearcherComponent } from '@modules/feature-modules/generic-tree-node-searcher/generic-tree-node-searcher.component';
import { TranslateService } from '@ngx-translate/core';
import { CustomDialogFooterConfigI } from '@shared/modules/custom-dialog/interfaces/custom-dialog-footer-config';
import { ComponentToExtendForCustomDialog } from '@shared/modules/custom-dialog/models/component-for-custom-dialog';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { Observable, of } from 'rxjs';

export const enum AdvSearchCriteriaDialogComponentModalEnum {
  ID = 'adv-search-criteria-dialog-id',
  PANEL_CLASS = 'adv-search-criteria-dialog',
  TITLE = 'common.advSearch.criteria'
}

@Component({
  selector: 'app-adv-search-criteria-dialog',
  templateUrl: './adv-search-criteria-dialog.component.html',
  styleUrls: ['./adv-search-criteria-dialog.component.scss']
})
export class AdvSearchCriteriaDialogComponent extends ComponentToExtendForCustomDialog implements OnInit {
  @ViewChild('genericTreeNodeSearcher') genericTreeNodeSearcher: GenericTreeNodeSearcherComponent;
  public treeNodes: TreeNode[] = [];
  public mode: 'CRITERIA' | 'COLUMNS' = null;
  public labels = {
    collapseAll: marker('common.collapse'),
    expandAll: marker('common.expand'),
    showSelectedNodes: marker('advSearch.criteria.showSelectedNodes'),
    showAllNodes: marker('advSearch.criteria.showAllNodes')
  };
  constructor(private confirmDialogService: ConfirmDialogService, private translateService: TranslateService) {
    super(AdvSearchCriteriaDialogComponentModalEnum.ID, AdvSearchCriteriaDialogComponentModalEnum.PANEL_CLASS, '');
  }

  ngOnInit(): void {
    if (this.extendedComponentData.mode === 'COLUMNS') {
      super.MODAL_TITLE = marker('advSearch.columns.title');
    } else {
      super.MODAL_TITLE = marker('advSearch.criteria.title');
    }
    if (this.extendedComponentData.title) {
      this.MODAL_TITLE = this.extendedComponentData.title;
    }
    this.mode = this.extendedComponentData.mode === 'COLUMNS' ? this.extendedComponentData.mode : 'CRITERIA';
    const options: AdvancedSearchOptionsDTO = this.extendedComponentData.options;
    const selected: AdvancedSearchItem[] = this.extendedComponentData.selected ? [...this.extendedComponentData.selected] : [];
    if (options?.cards && Object.keys(options.cards).length) {
      const treeNode: TreeNode = {
        name:
          this.mode === 'CRITERIA'
            ? this.translateService.instant(marker('advSearch.criteria.cards'))
            : this.translateService.instant(marker('advSearch.columns.cards')),
        children: []
      };
      Object.keys(options.cards).forEach((k) => {
        treeNode.children.push({
          name: k,
          children: options.cards[k].map((d) => ({
            ...d,
            selected: selected.find((s) => s.tabItem?.id === d.id) ? true : false
          }))
        } as TreeNode);
      });
      this.treeNodes.push(treeNode);
    }
    if (options?.entities && Object.keys(options.entities).length) {
      const treeNode: TreeNode = {
        name:
          this.mode === 'CRITERIA'
            ? this.translateService.instant(marker('advSearch.criteria.entities'))
            : this.translateService.instant(marker('advSearch.columns.entities')),
        children: []
      };
      Object.keys(options.entities).forEach((k) => {
        treeNode.children.push({
          name: k,
          children: options.entities[k].map((d) => ({
            ...d,
            selected: selected.find((s) => s.variable?.id === d.id) ? true : false
          }))
        } as TreeNode);
      });
      this.treeNodes.push(treeNode);
    }
  }

  public confirmCloseCustomDialog(): Observable<boolean> {
    return this.confirmDialogService.open({
      title: this.translateService.instant(marker('common.warning')),
      message: this.translateService.instant(marker('errors.ifContinueLosingChanges'))
    });
  }

  public onSubmitCustomDialog(): Observable<AdvancedSearchItem[]> {
    return of(
      this.extractTreeSelectedNodes(
        [],
        this.genericTreeNodeSearcher.originalData as CardColumnTabItemDTO[] | AdvSearchVariableDTO[],
        this.extendedComponentData.selected
      )
    );
  }

  public extractTreeSelectedNodes(
    result: AdvancedSearchItem[],
    tree: CardColumnTabItemDTO[] | AdvSearchVariableDTO[],
    oldSelectedItems: AdvancedSearchItem[]
  ): AdvancedSearchItem[] {
    //Tenemos dos tipos de datos englobados en AdvancedSearchItem:
    // - los asociados a la ficha => CardColumnTabItemDTO
    // - los asociados a la entidad => AdvSearchVariableDTO
    tree.forEach((node) => {
      if (node.children?.length) {
        result = this.extractTreeSelectedNodes(
          result,
          node.children as CardColumnTabItemDTO[] | AdvSearchVariableDTO[],
          oldSelectedItems
        );
      } else if (node.selected) {
        console.log('Es posible que tengamos que setear algunos de los valores por defecto');
        const advancedSearchItem: AdvancedSearchItem = {
          id: null,
          advancedSearchId: null,
          advancedSearchOperator: null,
          tabItem: null,
          value: null,
          variable: null
        };
        let found: AdvancedSearchItem = null;
        if (Object.keys(node).indexOf('typeItem') >= 0) {
          // El nodo es de tipo CardColumnTabItemDTO
          found = oldSelectedItems.find((item) => item.tabItem?.id === (node as CardColumnTabItemDTO).id);
          advancedSearchItem.tabItem = node as CardColumnTabItemDTO;
        } else {
          // El nodo es de tipo AdvSearchVariableDTO
          found = oldSelectedItems.find((item) => item.variable?.id === (node as AdvSearchVariableDTO).id);
          advancedSearchItem.variable = node as AdvSearchVariableDTO;
        }
        if (found) {
          result.push(found);
        } else {
          result.push(advancedSearchItem);
        }
      }
    });
    return result;
  }

  public setAndGetFooterConfig(): CustomDialogFooterConfigI | null {
    return {
      show: true,
      leftSideButtons: [
        {
          type: 'close',
          label: marker('common.cancel'),
          design: 'flat'
        }
      ],
      rightSideButtons: [
        {
          type: 'submit',
          label: marker('common.confirm'),
          design: 'raised',
          color: 'primary'
        }
      ]
    };
  }
}
