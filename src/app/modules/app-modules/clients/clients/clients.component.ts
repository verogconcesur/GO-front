import { Component, OnInit, ViewChild } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CustomerEntityDTO from '@data/models/entities/customer-entity-dto';
import { Observable } from 'rxjs';
import { ClientsListComponent } from '../components/clients-list/clients-list.component';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {
  @ViewChild('clientsList') clientsListComponent: ClientsListComponent;

  public labels = {
    createClient: marker('entities.customers.create'),
    title: marker('entities.customers.title')
  };

  constructor() {}

  ngOnInit(): void {}

  buttonCreateAction(): void {
    this.clientsListComponent.openCreateEditClientDialog();
  }
  public getFilteredData = (text: string): Observable<{ content: CustomerEntityDTO[] } | null> =>
    this.clientsListComponent.getFilteredData(text);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public buttonSearchAction(option: any): void {
    return this.clientsListComponent.showFilterOptionSelected(option);
  }
}
