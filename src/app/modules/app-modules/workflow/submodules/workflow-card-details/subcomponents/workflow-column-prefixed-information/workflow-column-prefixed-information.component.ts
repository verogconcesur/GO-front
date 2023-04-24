import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardColumnTabDTO from '@data/models/cards/card-column-tab-dto';
import CardInstanceDTO, { CardInstanceInformationDTO } from '@data/models/cards/card-instance-dto';
import { CardService } from '@data/services/cards.service';
import { WorkflowPrepareAndMoveService } from '@modules/app-modules/workflow/aux-service/workflow-prepare-and-move-aux.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-workflow-column-prefixed-information',
  templateUrl: './workflow-column-prefixed-information.component.html',
  styleUrls: ['./workflow-column-prefixed-information.component.scss']
})
export class WorkflowColumnPrefixedInformationComponent implements OnInit {
  @Input() tab: CardColumnTabDTO = null;
  @Input() cardInstance: CardInstanceDTO;

  public labels = {
    workOrderInformation: marker('workflows.workOrderInformation'),
    createdOn: marker('common.createdOn'),
    updatedOn: marker('common.updatedOn'),
    origin: marker('common.origin'),
    taskDescription: marker('workflows.taskDescription'),
    tag: marker('workflows.tag'),
    cancel: marker('common.cancel'),
    edit: marker('common.edit'),
    save: marker('common.save'),
    required: marker('errors.required')
  };
  public informationForm: FormGroup;
  public editMode = false;
  constructor(
    private cardService: CardService,
    private globalMessageService: GlobalMessageService,
    private translateService: TranslateService,
    private fb: FormBuilder,
    private prepareAndMoveService: WorkflowPrepareAndMoveService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }
  public initForm(): void {
    this.informationForm = this.fb.group({
      instanceInformation: [this.cardInstance.information.instanceInformation],
      tag1: [this.cardInstance.information.tag1],
      tag2: [this.cardInstance.information.tag2],
      tag3: [this.cardInstance.information.tag3]
    });
  }
  public edit() {
    this.editMode = true;
  }
  public cancel() {
    this.editMode = false;
    this.initForm();
  }
  public save() {
    const informationBody = this.informationForm.getRawValue() as CardInstanceInformationDTO;
    this.cardService
      .saveInformation(this.cardInstance.cardInstanceWorkflow.id, informationBody)
      .pipe(take(1))
      .subscribe(
        () => {
          this.editMode = false;
          this.prepareAndMoveService.reloadData$.next('UPDATE_INFORMATION');
        },
        (error: ConcenetError) => {
          this.editMode = false;
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      );
  }
}
