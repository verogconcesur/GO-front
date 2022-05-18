import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-users-header',
  templateUrl: './users-header.component.html',
  styleUrls: ['./users-header.component.scss']
})
export class UsersHeaderComponent implements OnInit {
  @Input() buttonLabel: string;
  @Input() showFilterButton: boolean;

  constructor() {}

  ngOnInit(): void {}
}
