import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import WorkflowSubstateEventDTO from '@data/models/workflows/workflow-substate-event-dto';
import WorkflowSubstateUserDTO from '@data/models/workflows/workflow-substate-user-dto';
// eslint-disable-next-line max-len
import { TextEditorWrapperConfigI } from '@modules/feature-modules/text-editor-wrapper/interfaces/text-editor-wrapper-config.interface';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-workflow-card-movement-preparation',
  templateUrl: './workflow-card-movement-preparation.component.html',
  styleUrls: ['./workflow-card-movement-preparation.component.scss']
})
export class WorkflowCardMovementPreparationComponent implements OnInit {
  public preparationIn: WorkflowSubstateEventDTO = null;
  public preparationInForm: UntypedFormGroup = null;
  public preparationOut: WorkflowSubstateEventDTO = null;
  public preparationOutForm: UntypedFormGroup = null;
  public users: WorkflowSubstateUserDTO[] = [];
  public textEditorToolbarOptions: TextEditorWrapperConfigI = {
    addHtmlModificationOption: false
  };
  public labels = {
    in: marker('prepareMovement.inTab'),
    out: marker('prepareMovement.outTab'),
    title: marker('prepareMovement.title'),
    size: marker('prepareMovement.size'),
    sizePlaceholder: marker('prepareMovement.sizePlaceholder'),
    user: marker('prepareMovement.user'),
    userPlaceholder: marker('prepareMovement.userPlaceholder'),
    template: marker('prepareMovement.template'),
    templatePlaceholder: marker('prepareMovement.templatePlaceholder'),
    required: marker('errors.required'),
    save: marker('common.save'),
    insertText: marker('common.insertTextHere')
  };
  public tabsToShow: ('IN' | 'OUT')[] = [];
  public tabToShow: 'IN' | 'OUT';

  constructor(
    public dialogRef: MatDialogRef<WorkflowCardMovementPreparationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { preparation: WorkflowSubstateEventDTO[]; users: WorkflowSubstateUserDTO[] },
    private fb: FormBuilder,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    //TODO DGDC QUITAR
    // this.data.preparation = [...this.data.preparation, { ...this.data.preparation[0], substateEventType: 'OUT' }];
    // console.log(this.data.preparation);
    this.data.preparation.forEach((p: WorkflowSubstateEventDTO) => {
      if (p.substateEventType === 'IN') {
        this.tabsToShow.push('IN');
        this.preparationIn = p;
      } else {
        this.tabsToShow.push('OUT');
        this.preparationOut = p;
      }
      this.tabToShow = this.tabsToShow[0];
    });
    this.users = this.data.users;
    this.initForm();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public tabSelected(event: any) {
    if (event.index === 0) {
      this.tabToShow = 'IN';
    } else {
      this.tabToShow = 'OUT';
    }
  }

  public initForm(): void {
    if (this.preparationIn) {
      this.preparationInForm = this.fb.group({
        size: [null, [this.preparationIn.requiredSize ? Validators.required : null]],
        user: [null, [this.preparationIn.requiredUser ? Validators.required : null]],
        template: [
          this.preparationIn.templateComunication?.processedTemplate
            ? this.preparationIn.templateComunication.processedTemplate
            : '',
          [this.preparationIn.sendMail ? Validators.required : null]
        ]
      });
    }
    if (this.preparationOut) {
      this.preparationOutForm = this.fb.group({
        size: [null, [this.preparationOut.requiredSize ? Validators.required : null]],
        user: [null, [this.preparationOut.requiredUser ? Validators.required : null]],
        template: [
          this.preparationOut.templateComunication?.processedTemplate
            ? this.preparationOut.templateComunication.processedTemplate
            : '',
          [this.preparationOut.sendMail ? Validators.required : null]
        ]
      });
    }
  }

  public textEditorContentChanged(html: string, form: UntypedFormGroup) {
    if (html !== form.controls.template.value) {
      form.get('template').setValue(html, { emitEvent: true });
      form.get('template').markAsDirty();
      form.get('template').markAsTouched();
    }
  }

  public getTabLabel(tab: 'IN' | 'OUT'): string {
    if (tab === 'IN') {
      return this.translateService.instant(this.labels.in);
    }
    return this.translateService.instant(this.labels.out);
  }

  public close(): void {
    this.dialogRef.close();
  }

  public save(): void {
    this.dialogRef.close({
      in: this.preparationInForm ? this.preparationInForm.value : null,
      out: this.preparationOutForm ? this.preparationOutForm.value : null
    });
  }

  public disableSaveButton(): boolean {
    return this.preparationInForm?.invalid || this.preparationOutForm?.invalid;
  }
}
