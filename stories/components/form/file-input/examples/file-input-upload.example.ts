import type { HttpEvent } from '@angular/common/http';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import type { Observable, Subscription } from 'rxjs';
import { interval, map, take } from 'rxjs';
import { MudFileInput, MudFileItem } from 'ngx-mud-ui/file-input';
import { MudLabel } from 'ngx-mud-ui/label';

interface UploadRow {
  file: File;
  state: 'uploading' | 'success' | 'error';
  progress?: number;
  error?: string;
}

// Stands in for http.post(url, body, { reportProgress: true, observe: 'events' }).
// Files over 5 MB fail at 40%, so the error row shows too.
function upload(file: File): Observable<HttpEvent<unknown>> {
  return interval(250).pipe(
    take(11),
    map((step): HttpEvent<unknown> => {
      if (file.size > 5 * 1024 * 1024 && step === 4) throw new Error('rejected');

      return step < 10
        ? {
            type: HttpEventType.UploadProgress,
            loaded: (file.size * (step + 1)) / 10,
            total: file.size,
          }
        : new HttpResponse({ status: 200 });
    }),
  );
}

@Component({
  selector: 'app-file-input-upload',
  imports: [MudFileInput, MudFileItem, MudLabel],
  template: `
    <!-- Hide the built-in list and render your own rows with state and progress. -->
    <mud-file-input
      accept=".pdf,image/*"
      multiple
      [showFileList]="false"
      [value]="files()"
      (valueChange)="picked($event)"
    >
      <mud-label>Documente</mud-label>
    </mud-file-input>
    @for (row of rows(); track row.file) {
      <mud-file-item
        [filename]="row.file.name"
        [size]="row.file.size"
        [state]="row.state"
        [progress]="row.progress"
        [errorText]="row.error"
        (removed)="remove(row.file)"
      />
    }
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
export class FileInputUploadExample {
  private readonly _uploads = new Map<File, Subscription>();

  readonly files = signal<File[]>([]);
  readonly rows = signal<UploadRow[]>([]);

  constructor() {
    inject(DestroyRef).onDestroy(() => this._uploads.forEach((request) => request.unsubscribe()));
  }

  picked(files: File[]): void {
    this.files.set(files);

    for (const file of files) {
      if (!this._uploads.has(file)) this._start(file);
    }
  }

  remove(file: File): void {
    // Unsubscribing cancels the request, so this also stops an upload in progress.
    this._uploads.get(file)?.unsubscribe();
    this._uploads.delete(file);
    this.files.update((list) => list.filter((entry) => entry !== file));
    this.rows.update((list) => list.filter((row) => row.file !== file));
  }

  private _start(file: File): void {
    this.rows.update((list) => [...list, { file, state: 'uploading', progress: 0 }]);

    const request = upload(file).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this._patch(file, { progress: (100 * event.loaded) / event.total });
        } else if (event.type === HttpEventType.Response) {
          this._patch(file, { state: 'success' });
        }
      },
      error: () => this._patch(file, { state: 'error', error: 'Încărcarea a eșuat. Reîncercați.' }),
    });

    this._uploads.set(file, request);
  }

  private _patch(file: File, change: Partial<UploadRow>): void {
    this.rows.update((list) =>
      list.map((row) => (row.file === file ? { ...row, ...change } : row)),
    );
  }
}
