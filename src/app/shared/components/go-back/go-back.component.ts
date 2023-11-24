import { Location } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'go-back',
  templateUrl: './go-back.component.html',
  styleUrls: ['./go-back.component.scss']
})
export class GoBackComponent {
  constructor(private location: Location) {}

  public goBack(): void {
    this.location.back();
  }
}
