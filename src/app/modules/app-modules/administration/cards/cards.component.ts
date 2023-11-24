import { Component, OnInit, ViewChild } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardDTO from '@data/models/cards/card-dto';
import { Observable } from 'rxjs';
import { CardsListComponent } from './components/cards-list/cards-list.component';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent implements OnInit {
  @ViewChild('cardsList') cardsListComponent: CardsListComponent;

  public labels = {
    createCard: marker('cards.create'),
    cardTitle: marker('administration.cards')
  };

  constructor() {}

  ngOnInit(): void {}

  public buttonCreateAction(): void {
    this.cardsListComponent.createEditCard();
  }

  public getFilteredData = (text: string): Observable<{ content: CardDTO[] } | null> =>
    this.cardsListComponent.getFilteredData(text);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public buttonSearchAction(option: any): void {
    return this.cardsListComponent.showFilterOptionSelected(option);
  }
}
