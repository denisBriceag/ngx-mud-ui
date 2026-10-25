import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudFileItem } from './mud-file-item.component';

const css = () => [...document.querySelectorAll('style')].map((s) => s.textContent ?? '').join('\n');

describe('file item styles', () => {
  it('a file item rendered on its own loads the file-input CSS', () => {
    @Component({ imports: [MudFileItem], template: `<mud-file-item filename="a.pdf" />` })
    class Host {}

    TestBed.createComponent(Host).detectChanges();

    expect(css()).toMatch(/\.file-item\s*\{/);
  });

  it('ships the progress bar and the system card', () => {
    @Component({ imports: [MudFileItem], template: `<mud-file-item filename="a.pdf" />` })
    class Host {}

    TestBed.createComponent(Host).detectChanges();

    expect(css()).toMatch(/\.file-item__progress-fill\s*\{[^}]*background-color:\s*var\(--mud-color-background-brand-default\)/);
    expect(css()).toMatch(/\.file-item--system\s*\{[^}]*background-color:\s*var\(--mud-color-background-base-secondary\)/);
    // Error must out-rank the system surface by specificity, not source order.
    expect(css()).toMatch(/\.file-item--system\.file-item--error\s*\{/);
  });
});
