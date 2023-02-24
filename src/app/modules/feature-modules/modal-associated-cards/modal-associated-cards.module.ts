import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalAssociatedCardsComponent } from './modal-associated-cards.component';
import { ModalAssociatedCardsService } from './modal-associated-cards.service';
import { SharedModule } from '@shared/shared.module';
import { WorkflowCardModule } from '../workflow-card/workflow-card.module';

@NgModule({
  declarations: [ModalAssociatedCardsComponent],
  imports: [CommonModule, SharedModule, WorkflowCardModule],
  exports: [ModalAssociatedCardsComponent],
  providers: [ModalAssociatedCardsService]
})
export class ModalAssociatedCardsModule {}
