import { Component } from '@angular/core';
import { MudButton } from 'ngx-mud-ui/button';

@Component({
  selector: 'app-button-basic',
  imports: [MudButton],
  template: `<button type="button" mudButton (click)="save()">Save</button>`,
})
export class ButtonBasicExample {
  save(): void {
    console.log('Saved');
  }
}
