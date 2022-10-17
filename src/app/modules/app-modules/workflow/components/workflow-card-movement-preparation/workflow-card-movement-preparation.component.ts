import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import UserDTO from '@data/models/user-permissions/user-dto';
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
  public taskForm: UntypedFormGroup = null;
  public formsCreated = false;
  public preparationIn: WorkflowSubstateEventDTO = null;
  public preparationInForm: UntypedFormGroup = null;
  public preparationOut: WorkflowSubstateEventDTO = null;
  public preparationOutForm: UntypedFormGroup = null;
  public usersIn: WorkflowSubstateUserDTO[] = [];
  public usersOut: WorkflowSubstateUserDTO[] = [];
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
    insertText: marker('common.insertTextHere'),
    taskLabel: marker('prepareMovement.taskLabel'),
    taskPlaceholder: marker('prepareMovement.taskPlaceholder')
  };
  public tabsToShow: ('IN' | 'OUT')[] = [];
  public tabToShow: 'IN' | 'OUT';
  public sendToOtherWorkflow = false;

  constructor(
    public dialogRef: MatDialogRef<WorkflowCardMovementPreparationComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      preparation: WorkflowSubstateEventDTO[];
      usersIn: WorkflowSubstateUserDTO[];
      usersOut: WorkflowSubstateUserDTO[];
      view: 'MOVES_IN_THIS_WORKFLOW' | 'MOVES_IN_OTHER_WORKFLOWS';
      selectedUser: WorkflowSubstateUserDTO;
    },
    private fb: FormBuilder,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    // this.data.preparation = [...this.data.preparation, { ...this.data.preparation[0], substateEventType: 'OUT' }];
    this.data.preparation.forEach((p: WorkflowSubstateEventDTO) => {
      if (p.substateEventType === 'IN') {
        this.tabsToShow.push('IN');
        this.preparationIn = p;
      } else {
        this.tabsToShow.push('OUT');
        this.preparationOut = p;
      }
      this.tabToShow = this.tabsToShow.length === 2 ? 'OUT' : this.tabsToShow[0];
    });
    if (this.data.view === 'MOVES_IN_OTHER_WORKFLOWS') {
      this.sendToOtherWorkflow = true;
    }
    this.usersIn = this.data.usersIn;
    this.usersOut = this.data.usersOut;
    this.initForm();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public tabSelected(event: any) {
    if (this.tabsToShow.length === 1) {
      this.tabToShow = this.tabsToShow[0];
    } else if (this.tabsToShow.length === 2) {
      if (event.index === 1) {
        this.tabToShow = 'IN';
      } else {
        this.tabToShow = 'OUT';
      }
    }
  }

  public initForm(): void {
    if (this.sendToOtherWorkflow) {
      this.taskForm = this.fb.group({
        description: [null, Validators.required]
      });
    }
    console.log(this.data);
    if (this.preparationIn) {
      this.preparationInForm = this.fb.group({});
      if (this.preparationIn.requiredSize) {
        this.preparationInForm.addControl('size', this.fb.control(null, [Validators.required]));
      }
      if (this.preparationIn.requiredUser) {
        this.preparationInForm.addControl(
          'user',
          this.fb.control(
            this.data.selectedUser
              ? this.usersIn.find((user: WorkflowSubstateUserDTO) => user.user.id === this.data.selectedUser?.user?.id)
              : null,
            [Validators.required]
          )
        );
      }
      if (this.preparationIn.sendMail) {
        this.preparationInForm.addControl(
          'template',
          this.fb.control(
            this.preparationIn.templateComunication?.processedTemplate
              ? this.preparationIn.templateComunication.processedTemplate
              : '',
            [Validators.required]
          )
        );
      }
    }
    if (this.preparationOut) {
      this.preparationOutForm = this.fb.group({});
      if (this.preparationOut.requiredSize) {
        this.preparationOutForm.addControl('size', this.fb.control(null, [Validators.required]));
      }
      if (this.preparationOut.requiredUser) {
        this.preparationOutForm.addControl(
          'user',
          this.fb.control(
            this.data.selectedUser
              ? this.usersOut.find((user: WorkflowSubstateUserDTO) => user.user.id === this.data.selectedUser?.user?.id)
              : null,
            [Validators.required]
          )
        );
      }
      if (this.preparationOut.sendMail) {
        this.preparationOutForm.addControl(
          'template',
          this.fb.control(
            this.preparationOut.templateComunication?.processedTemplate
              ? this.preparationOut.templateComunication.processedTemplate
              : '',
            [Validators.required]
          )
        );
      }
    }
    this.formsCreated = true;
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
      task: this.taskForm ? this.taskForm.value : null,
      in: this.preparationInForm ? this.preparationInForm.value : null,
      out: this.preparationOutForm ? this.preparationOutForm.value : null
    });
  }

  public disableSaveButton(): boolean {
    return this.taskForm?.invalid || this.preparationInForm?.invalid || this.preparationOutForm?.invalid;
  }
}
