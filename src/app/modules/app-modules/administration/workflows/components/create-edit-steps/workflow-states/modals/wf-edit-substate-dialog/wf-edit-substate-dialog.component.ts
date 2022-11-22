import { Component, OnInit } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI } from '@jenga/custom-dialog';
import { Observable, of } from 'rxjs';

export const enum WfEditSubstateComponentModalEnum {
  ID = 'edit-substate-dialog-id',
  PANEL_CLASS = 'edit-substate-dialog',
  TITLE = 'workflows.editSubstate'
}
@Component({
  selector: 'app-wf-edit-substate-dialog',
  templateUrl: './wf-edit-substate-dialog.component.html',
  styleUrls: ['./wf-edit-substate-dialog.component.scss']
})
export class WfEditSubstateDialogComponent extends ComponentToExtendForCustomDialog implements OnInit {
  constructor() {
    super(WfEditSubstateComponentModalEnum.ID, WfEditSubstateComponentModalEnum.PANEL_CLASS, marker('workflows.editSubstate'));
  }

  ngOnInit(): void {}

  public confirmCloseCustomDialog(): Observable<boolean> {
    return of(true);
  }

  public onSubmitCustomDialog(): Observable<boolean> {
    return of(true);
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
          label: marker('common.save'),
          design: 'raised',
          color: 'primary'
          // disabledFn: () => !(this.workflowForm.touched && this.workflowForm.dirty && this.workflowForm.valid)
        }
      ]
    };
  }
}
