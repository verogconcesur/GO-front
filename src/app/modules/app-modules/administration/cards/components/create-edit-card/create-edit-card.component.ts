import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardColumnDTO from '@data/models/cards/card-column-dto';
import CardDTO from '@data/models/cards/card-dto';
import { TranslateService } from '@ngx-translate/core';
import { CardService } from '@data/services/cards.service';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { NGXLogger } from 'ngx-logger';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { finalize, take } from 'rxjs/operators';
import { RouteConstants } from '@app/constants/route.constants';
import { ConcenetError } from '@app/types/error';

@Component({
  selector: 'app-create-edit-card',
  templateUrl: './create-edit-card.component.html',
  styleUrls: ['./create-edit-card.component.scss']
})
export class CreateEditCardComponent implements OnInit {
  public labels = {
    create: marker('cards.modal.create'),
    edit: marker('cards.modal.create'),
    column: marker('cards.modal.column'),
    comments: marker('cards.modal.comments'),
    messages: marker('common.messages'),
    actions: marker('common.actions'),
    name: marker('cards.modal.cardName'),
    nameRequired: marker('userProfile.nameRequired'),
    cancel: marker('common.cancel'),
    save: marker('common.save')
  };
  public cardForm: FormGroup;
  public cardToEdit: CardDTO = null;
  public selectedCol = 1;
  public dataLoaded = false;
  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private cardService: CardService,
    private confirmationDialog: ConfirmDialogService,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private logger: NGXLogger,
    private spinnerService: ProgressSpinnerDialogService,
    private router: Router
  ) {}
  get form() {
    return this.cardForm.controls;
  }
  get cols() {
    return this.cardForm.controls.cols as FormArray;
  }
  public changeColumn(col: CardColumnDTO) {
    this.selectedCol = col.orderNumber;
  }
  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params.idCard) {
        this.getCardDetail(params.idCard);
      } else {
        this.initializeForm();
      }
    });
  }
  public isSaveDisabled() {
    return this.cardForm.invalid || !this.cardForm.touched;
  }
  public cancel(): void {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('cards.modal.cancelConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          this.router.navigate([RouteConstants.ADMINISTRATION, RouteConstants.CARDS]);
        }
      });
  }
  public save(): void {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('cards.modal.saveConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          const spinner = this.spinnerService.show();
          const cardDetail = this.cardForm.getRawValue();
          this.cardService
            .createEditCard(cardDetail)
            .pipe(
              take(1),
              finalize(() => this.spinnerService.hide(spinner))
            )
            .subscribe({
              next: (response) => {
                this.router.navigate([RouteConstants.ADMINISTRATION, RouteConstants.CARDS]);
              },
              error: (error: ConcenetError) => {
                this.logger.error(error);
                this.globalMessageService.showError({
                  message: error.message,
                  actionText: this.translateService.instant(marker('common.close'))
                });
              }
            });
        }
      });
  }
  private getCardDetail(idCard: number): void {
    const spinner = this.spinnerService.show();
    this.cardService.getCardById(idCard).subscribe((res) => {
      this.cardToEdit = res;
      this.initializeForm();
      this.spinnerService.hide(spinner);
    });
  }
  private initializeForm = (): void => {
    this.cardForm = this.fb.group({
      id: [this.cardToEdit ? this.cardToEdit.id : null],
      name: [this.cardToEdit ? this.cardToEdit.name : '', Validators.required],
      cols: this.initializeCols()
    });
  };
  private initializeCols(): FormArray {
    return this.fb.array([
      this.fb.group({
        id: [this.cardToEdit ? this.cardToEdit.cols[0].id : null],
        cardId: [this.cardToEdit ? this.cardToEdit.id : null],
        colType: [this.cardToEdit ? this.cardToEdit.cols[0].colType : 'TABS'],
        orderNumber: [1, [Validators.required]],
        name: [
          this.cardToEdit ? this.cardToEdit.cols[0].name : this.translate.instant(this.labels.column) + 1,
          [Validators.required]
        ],
        tabs: this.fb.array([])
      }),
      this.fb.group({
        id: [this.cardToEdit ? this.cardToEdit.cols[1].id : null],
        cardId: [this.cardToEdit ? this.cardToEdit.id : null],
        colType: [this.cardToEdit ? this.cardToEdit.cols[1].colType : 'TABS'],
        orderNumber: [2, [Validators.required]],
        name: [
          this.cardToEdit ? this.cardToEdit.cols[1].name : this.translate.instant(this.labels.column) + 2,
          [Validators.required]
        ],
        tabs: this.fb.array([])
      }),
      this.fb.group({
        id: [this.cardToEdit ? this.cardToEdit.cols[2].id : null],
        cardId: [this.cardToEdit ? this.cardToEdit.id : null],
        colType: [this.cardToEdit ? this.cardToEdit.cols[2].colType : 'SOCIAL'],
        orderNumber: [3, [Validators.required]],
        name: [
          this.cardToEdit ? this.cardToEdit.cols[2].name : this.translate.instant(this.labels.comments),
          [Validators.required]
        ],
        tabs: this.fb.array([])
      }),
      this.fb.group({
        id: [this.cardToEdit ? this.cardToEdit.cols[3].id : null],
        cardId: [this.cardToEdit ? this.cardToEdit.id : null],
        colType: [this.cardToEdit ? this.cardToEdit.cols[3].colType : 'ACTIONS'],
        orderNumber: [4, [Validators.required]],
        name: [
          this.cardToEdit ? this.cardToEdit.cols[3].name : this.translate.instant(this.labels.actions),
          [Validators.required]
        ],
        tabs: this.fb.array([])
      })
    ]);
  }
}
