import { Component, Input, OnInit } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

@Component({
  selector: 'app-users-header',
  templateUrl: './users-header.component.html',
  styleUrls: ['./users-header.component.scss']
})
export class UsersHeaderComponent implements OnInit {
  @Input() buttonLabel: string;
  @Input() showFilterButton: boolean;

  public labels = {
    search: marker('common.search')
  };

  constructor() {}

  ngOnInit(): void {}
}
