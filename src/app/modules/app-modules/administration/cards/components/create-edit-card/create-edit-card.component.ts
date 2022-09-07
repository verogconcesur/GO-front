import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardColumnDTO from '@data/models/cards/card-column-dto';
import CardDTO from '@data/models/cards/card-dto';
import { TranslateService } from '@ngx-translate/core';

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

  constructor(private fb: FormBuilder, private translate: TranslateService) {}
  get form() {
    return this.cardForm.controls;
  }
  get cols() {
    return this.cardForm.controls.cols as FormArray;
  }
  public changeColumn(col: CardColumnDTO){
    this.selectedCol = col.orderNumber;
  }
  ngOnInit(): void {
    this.initializeForm();
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
        orderNumber: [1, [Validators.required]],
        name: [
          this.cardToEdit ? this.cardToEdit.cols[0].name : (this.translate.instant(this.labels.column) + 1),
          [Validators.required]
        ],
        tabs: [this.fb.array([]), [Validators.required]]
      }),
      this.fb.group({
        orderNumber: [2, [Validators.required]],
        name: [
          this.cardToEdit ? this.cardToEdit.cols[1].name : (this.translate.instant(this.labels.column) + 2),
          [Validators.required]
        ],
        tabs: [this.fb.array([]), [Validators.required]]
      }),
      this.fb.group({
        orderNumber: [3, [Validators.required]],
        name: [
          this.cardToEdit ? this.cardToEdit.cols[2].name : this.translate.instant(this.labels.comments),
          [Validators.required]
        ],
        tabs: [this.fb.array([]), [Validators.required]]
      }),
      this.fb.group({
        orderNumber: [4, [Validators.required]],
        name: [
          this.cardToEdit ? this.cardToEdit.cols[3].name : this.translate.instant(this.labels.actions),
          [Validators.required]
        ],
        tabs: [this.fb.array([]), [Validators.required]]
      })
    ]);
  }
}
