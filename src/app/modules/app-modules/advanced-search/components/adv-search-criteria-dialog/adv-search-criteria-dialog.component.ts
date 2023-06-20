import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, UntypedFormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import TreeNode from '@data/interfaces/tree-node';
import AdvancedSearchOptionsDTO from '@data/models/adv-search/adv-search-options-dto';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI } from '@jenga/custom-dialog';
import { GenericTreeNodeSearcherComponent } from '@modules/feature-modules/generic-tree-node-searcher/generic-tree-node-searcher.component';
import { TranslateService } from '@ngx-translate/core';
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
  public criteriaForm: UntypedFormGroup;
  public treeNodes: TreeNode[] = [];
  constructor(
    private fb: FormBuilder,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService
  ) {
    super(
      AdvSearchCriteriaDialogComponentModalEnum.ID,
      AdvSearchCriteriaDialogComponentModalEnum.PANEL_CLASS,
      marker('advSearch.criteria.title')
    );
  }

  ngOnInit(): void {
    console.log(this.extendedComponentData);
    if (this.extendedComponentData.options?.cards && Object.keys(this.extendedComponentData.options.cards).length) {
      const treeNode: TreeNode = {
        name: marker('advSearch.criteria.cards'),
        children: []
      };
      Object.keys(this.extendedComponentData.options.cards).forEach((k) => {
        treeNode.children.push({
          name: k,
          children: this.extendedComponentData.options.cards[k].map((d: TreeNode) => ({ ...d, selected: false }))
        } as TreeNode);
      });
      this.treeNodes.push(treeNode);
    }
    if (this.extendedComponentData.options?.entities && Object.keys(this.extendedComponentData.options.entities).length) {
      const treeNode: TreeNode = {
        name: marker('advSearch.criteria.entities'),
        children: []
      };
      Object.keys(this.extendedComponentData.options.entities).forEach((k) => {
        treeNode.children.push({
          name: k,
          children: this.extendedComponentData.options.entities[k].map((d: TreeNode) => ({ ...d, selected: false }))
        } as TreeNode);
      });
      this.treeNodes.push(treeNode);
    }
    this.initializeForm();
  }

  public confirmCloseCustomDialog(): Observable<boolean> {
    if (this.criteriaForm.touched && this.criteriaForm.dirty) {
      return this.confirmDialogService.open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.unsavedChangesExit'))
      });
    } else {
      return of(true);
    }
  }

  public onSubmitCustomDialog(): Observable<AdvancedSearchOptionsDTO> {
    console.log(this.genericTreeNodeSearcher.originalData);
    return of(this.criteriaForm.getRawValue() as AdvancedSearchOptionsDTO);
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

  private initializeForm = (): void => {
    this.criteriaForm = this.fb.group({});
  };
}
