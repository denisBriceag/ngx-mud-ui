import { Component } from '@angular/core';
import { MudFileItem } from 'ngx-mud-ui/file-input';
import { MudIconComponent } from 'ngx-mud-ui/icons';

// The icons are registered once in app.config.ts: provideMudIcons([pdfFile, image])
@Component({
  selector: 'app-file-input-items',
  imports: [MudFileItem, MudIconComponent],
  template: `
    <mud-file-item filename="buletin.pdf" [size]="245760" />
    <mud-file-item filename="dovada-plata.pdf" [size]="1048576" state="uploading" />
    <mud-file-item
      filename="extras-bancar.pdf"
      [size]="3145728"
      state="uploading"
      [progress]="45"
    />
    <mud-file-item filename="cerere-semnata.pdf" [size]="524288" state="success" />
    <mud-file-item
      filename="scanare.tiff"
      [size]="94371840"
      state="error"
      errorText="Fișierul depășește limita de 5 MB."
    />
    <mud-file-item filename="rezumat.pdf" [size]="12288" [removable]="false" />
    <mud-file-item filename="arhiva.zip" [size]="7340032" disabled />

    <!-- Your own leading icon -->
    <mud-file-item filename="cerere.pdf" [size]="245760"
      ><mud-icon icon name="pdf-file"
    /></mud-file-item>
    <mud-file-item filename="fotografie.png" [size]="1048576"
      ><mud-icon icon name="image"
    /></mud-file-item>

    <!-- A document issued by the state -->
    <mud-file-item variant="system" filename="certificat-de-nastere.pdf" [removable]="false">
      <span info>Emis <strong>12.03.2026</strong> · Agenția Servicii Publice</span>
    </mud-file-item>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 520px;
    }
  `,
})
export class FileInputItemsExample {}
