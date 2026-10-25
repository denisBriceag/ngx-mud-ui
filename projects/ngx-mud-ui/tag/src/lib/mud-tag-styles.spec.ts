import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudTag } from './mud-tag.component';
import { MudSegmentedControl } from 'ngx-mud-ui/segmented-control';
import { MudFileInput } from 'ngx-mud-ui/file-input';
import { MudPhoneInput } from 'ngx-mud-ui/phone-input';

const css = () => [...document.querySelectorAll('style')].map((s) => s.textContent ?? '').join('\n');
const styled = (root: string) => new RegExp(`\\.${root}\\s*\\{`);

describe('form component styles ship with the components', () => {
  it('tag', () => {
    @Component({ imports: [MudTag], template: `<mud-tag>New</mud-tag>` })
    class Host {}

    TestBed.createComponent(Host).detectChanges();
    expect(css()).toMatch(styled('status-tag'));
    // A long label ends in an ellipsis: only a non-flex box can show one.
    expect(css()).toMatch(
      /\.status-tag:not\(:has\(> :is\(mud-icon, svg\)\)\)\s*\{[^}]*display:\s*inline-block/,
    );
  });

  it('segmented control', () => {
    @Component({ imports: [MudSegmentedControl], template: `<mud-segmented-control aria-label="View" />` })
    class Host {}

    TestBed.createComponent(Host).detectChanges();
    expect(css()).toMatch(styled('segmented-control'));
  });

  it('file input', () => {
    @Component({ imports: [MudFileInput], template: `<mud-file-input />` })
    class Host {}

    TestBed.createComponent(Host).detectChanges();
    expect(css()).toMatch(styled('file-field'));
  });

  it('phone input', () => {
    @Component({ imports: [MudPhoneInput], template: `<mud-phone-input />` })
    class Host {}

    TestBed.createComponent(Host).detectChanges();
    expect(css()).toMatch(/\.phone-field__flag\s*\{/);
  });
});
