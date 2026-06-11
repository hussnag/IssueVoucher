import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { Issuevoucher } from '../service/issuevoucher';
import { FolderPage } from './folder.page';

describe('FolderPage', () => {
  let component: FolderPage;
  let fixture: ComponentFixture<FolderPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FolderPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(FolderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should extract item id from a JSON-like scan result', () => {
    const itemId = component.extractItemIdFromScannedCode(
      '{"ItemName":"Coffee","ItemId":"1001"}',
    );

    expect(itemId).toBe('1001');
  });

  it('should extract item id from a pipe-separated scan result', () => {
    const itemId = component.extractItemIdFromScannedCode('Milk|2002');

    expect(itemId).toBe('2002');
  });

  it('should patch rate and amount from a nested item payload', () => {
    const issuevoucher = TestBed.inject(Issuevoucher);

    spyOn(issuevoucher, 'getItemDetailsById').and.returnValue(
      of({
        result: {
          data: {
            itemName: 'Coffee',
            unit: 'pcs',
            rate: 120,
            amount: 120,
          },
        },
      }),
    );

    component.getItemDetailsById('1001');

    expect(component.itemName).toBe('Coffee');
    expect(component.unit).toBe('pcs');
    expect(component.rate).toBe(120);
    expect(component.amount).toBe(120);
  });
});
