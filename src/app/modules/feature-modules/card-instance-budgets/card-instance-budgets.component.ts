import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AttachmentDTO, CardAttachmentsDTO } from '@data/models/cards/card-attachments-dto';
import { CardBudgetsDTO } from '@data/models/cards/card-budgets-dto';
import { CardAttachmentsService } from '@data/services/card-attachments.service';
import { CardBudgetsService } from '@data/services/card-budgets.service';
import { CardMessagesService } from '@data/services/card-messages.service';
import { CustomDialogService } from '@jenga/custom-dialog';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { NGXLogger } from 'ngx-logger';
import { take } from 'rxjs/operators';
import CardInstanceBudgetsConfig from './card-instance-budgets-config-interface';
import {
  SelectTemplateLinesComponent,
  SelectTemplateLinesComponentModalEnum
} from './modals/select-template-lines/select-template-lines.component';

@Component({
  selector: 'app-card-instance-budgets',
  templateUrl: './card-instance-budgets.component.html',
  styleUrls: ['./card-instance-budgets.component.scss']
})
export class CardInstanceBudgetsComponent implements OnInit {
  @Input() cardInstanceBudgetsConfig: CardInstanceBudgetsConfig;
  @Input() data: CardBudgetsDTO[] = [];
  @Input() cardInstanceWorkflowId: number = null;
  @Input() tabId: number = null;
  @Output() reload: EventEmitter<boolean> = new EventEmitter<boolean>();
  public labels = {
    okClient: marker('common.okClient'),
    line: marker('common.line'),
    amount: marker('common.amount'),
    actions: marker('common.actions'),
    newLine: marker('common.newLine'),
    send: marker('common.send'),
    attachments: marker('common.attachments'),
    deleteConfirmation: marker('common.deleteConfirmation'),
    maxLengthError: marker('errors.maxLengthError')
  };
  public formBudgets: FormArray;
  public currentBudget: CardBudgetsDTO;
  public templateLines: CardBudgetsDTO[];
  public attachmentsList: AttachmentDTO[];
  public editing = false;
  public maxAmount = 99999999;
  constructor(
    private fb: FormBuilder,
    private budgetsService: CardBudgetsService,
    private logger: NGXLogger,
    private translateService: TranslateService,
    private confirmationDialog: ConfirmDialogService,
    private globalMessageService: GlobalMessageService,
    private customDialogService: CustomDialogService,
    private attachmentService: CardAttachmentsService,
    private messagesServices: CardMessagesService
  ) {}
  public cancelBudget(budget: FormGroup, index: number): void {
    if (budget.value.id) {
      budget.patchValue(this.currentBudget);
      budget.get('editMode').setValue(false);
    } else {
      this.formBudgets.removeAt(index);
    }
    this.editing = false;
  }
  public enableSendButton(): boolean {
    return this.formBudgets.getRawValue() && !this.formBudgets.getRawValue().find((budget) => budget.editMode);
  }
  public sendBudgets(): void {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('cardDetail.budgets.sendConfirmation'))
      })
      .subscribe((ok: boolean) => {
        if (ok) {
          this.messagesServices
            .sendBudgetMessageClient(this.cardInstanceWorkflowId, this.tabId)
            .pipe(take(1))
            .subscribe(
              (data) => {
                this.reload.emit(true);
              },
              (error: ConcenetError) => {
                this.logger.error(error);

                this.globalMessageService.showError({
                  message: error.message,
                  actionText: this.translateService.instant(marker('common.close'))
                });
              }
            );
        }
      });
  }
  public saveBudget(budget: FormGroup): void {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('cardDetail.budgets.saveConfirmation'))
      })
      .subscribe((ok: boolean) => {
        if (ok) {
          if (budget.value.id) {
            this.budgetsService
              .editLine(this.cardInstanceWorkflowId, this.tabId, budget.getRawValue())
              .pipe(take(1))
              .subscribe(
                (data) => {
                  this.reload.emit(true);
                },
                (error: ConcenetError) => {
                  this.logger.error(error);

                  this.globalMessageService.showError({
                    message: error.message,
                    actionText: this.translateService.instant(marker('common.close'))
                  });
                }
              );
          } else {
            this.budgetsService
              .addLines(this.cardInstanceWorkflowId, this.tabId, [budget.getRawValue()])
              .pipe(take(1))
              .subscribe(
                (data) => {
                  this.reload.emit(true);
                },
                (error: ConcenetError) => {
                  this.logger.error(error);
                  this.globalMessageService.showError({
                    message: error.message,
                    actionText: this.translateService.instant(marker('common.close'))
                  });
                }
              );
          }
        }
      });
  }
  public deleteBudget(budget: FormGroup): void {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('cardDetail.budgets.deleteConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          this.budgetsService
            .deleteLine(this.cardInstanceWorkflowId, this.tabId, budget.value.id)
            .pipe(take(1))
            .subscribe(
              (data) => {
                this.reload.emit(true);
              },
              (error: ConcenetError) => {
                this.logger.error(error);

                this.globalMessageService.showError({
                  message: error.message,
                  actionText: this.translateService.instant(marker('common.close'))
                });
              }
            );
        }
      });
  }
  public editBudget(budget: FormGroup): void {
    this.editing = true;
    this.currentBudget = budget.getRawValue();
    budget.get('editMode').setValue(true);
  }
  public budgetDisabled(budget: FormGroup): boolean {
    return !budget.value.editMode;
  }
  public newLine() {
    if (this.data.find((line: CardBudgetsDTO) => line.workflowId === this.cardInstanceBudgetsConfig.workflowId)) {
      this.editing = true;
      this.formBudgets.push(
        this.fb.group({
          id: [null],
          accepted: [false],
          amount: ['', [Validators.max(this.maxAmount), Validators.required]],
          description: ['', Validators.required],
          editMode: [true],
          workflowId: [this.cardInstanceBudgetsConfig.workflowId],
          attachments: []
        })
      );
    } else {
      this.customDialogService
        .open({
          id: SelectTemplateLinesComponentModalEnum.ID,
          panelClass: SelectTemplateLinesComponentModalEnum.PANEL_CLASS,
          component: SelectTemplateLinesComponent,
          extendedComponentData: {
            data: this.templateLines,
            cardInstanceWorkflowId: this.cardInstanceWorkflowId,
            tabId: this.tabId
          },
          disableClose: true,
          width: '700px'
        })
        .pipe(take(1))
        .subscribe((response) => {
          if (response && response.newLine) {
            this.editing = true;
            this.formBudgets.push(
              this.fb.group({
                id: [null],
                accepted: [false],
                amount: ['', [Validators.max(this.maxAmount), Validators.required]],
                description: ['', Validators.required],
                editMode: [true],
                workflowId: [this.cardInstanceBudgetsConfig.workflowId]
              })
            );
          } else if (response) {
            this.globalMessageService.showSuccess({
              message: this.translateService.instant(marker('common.successOperation')),
              actionText: this.translateService.instant(marker('common.close'))
            });
            this.reload.emit(true);
          }
        });
    }
  }
  public initializeForms() {
    this.formBudgets = this.fb.array([]);
    if (this.data && this.data.length) {
      this.data.forEach((data: CardBudgetsDTO) => {
        data.attachments = data.attachments
          ? data.attachments.map((attachment: AttachmentDTO) => {
              let itemToReturn = attachment;
              this.attachmentsList.forEach((at: AttachmentDTO) => {
                if (at.id === attachment.id) {
                  itemToReturn = at;
                }
              });
              return itemToReturn;
            })
          : [];
        this.formBudgets.push(
          this.fb.group({
            id: [data.id],
            accepted: [data.accepted],
            amount: [data.amount, Validators.required],
            description: [data.description, [Validators.max(this.maxAmount), Validators.required]],
            editMode: [false],
            workflowId: [data.workflowId],
            attachments: [data.attachments]
          })
        );
      });
    }
  }
  ngOnInit(): void {
    this.data = this.data ? this.data : [];
    this.budgetsService
      .getLinesTemplate(this.cardInstanceWorkflowId, this.tabId)
      .pipe(take(1))
      .subscribe(
        (data) => {
          this.templateLines = data;
        },
        (error: ConcenetError) => {
          this.logger.error(error);
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      );
    this.attachmentService
      .getCardAttachmentsByInstance(this.cardInstanceWorkflowId)
      .pipe(take(1))
      .subscribe(
        (data) => {
          let attachmentList: AttachmentDTO[] = [];
          data.forEach((cardAttachment: CardAttachmentsDTO) => {
            attachmentList = [...attachmentList, ...cardAttachment.attachments];
          });
          this.attachmentsList = attachmentList;
          this.initializeForms();
        },
        (error: ConcenetError) => {
          this.logger.error(error);
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      );
  }
}
