import { Component, OnInit, ViewChild } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
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
}
