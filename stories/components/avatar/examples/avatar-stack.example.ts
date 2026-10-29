import { Component } from '@angular/core';
import { MudAvatar } from 'ngx-mud-ui/avatar';

@Component({
  selector: 'app-avatar-stack',
  imports: [MudAvatar],
  template: `
    <div class="avatar-stack" role="group" aria-label="Participants">
      @for (person of people; track person.name) {
        <mud-avatar [name]="person.name"
          ><img [src]="person.photo" [alt]="person.name"
        /></mud-avatar>
      }
      <mud-avatar label="5 more people">+5</mud-avatar>
    </div>
  `,
})
export class AvatarStackExample {
  readonly people = [
    { name: 'Olga Popescu', photo: 'avatars/person-1.svg' },
    { name: 'Ion Rusu', photo: 'avatars/person-2.svg' },
    { name: 'Ana Ciobanu', photo: 'avatars/person-3.svg' },
  ];
}
