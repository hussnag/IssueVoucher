import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { IonicModule } from '@ionic/angular';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';

import {
  addCircleOutline,
  addOutline,
  barcodeOutline,
  cartOutline,
  receiptOutline,
} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { ModalController } from '@ionic/angular';
import { Folder2Component } from '../folder2/folder2.component';
import { Issuevoucher } from '../service/issuevoucher';
import { AlertController } from '@ionic/angular';

interface ItemModel {
  name: string;
  unit: string;
  quantity: number;
  price: number;
  amount?: number;
  expanded: boolean;
  notes: string;
  modifiers: string;
  itemId?: string;
}

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
  imports: [CommonModule, FormsModule, IonicModule],
})
export class FolderPage implements OnInit {
  public folder!: string;
  public expanded = false;
  public scannedItem: ItemModel | null = null;
  public scannedItemId: string | null = null;
  public items: ItemModel[] = [];
  public locations = ['Site 1', 'Site 2', 'Warehouse'];
  public selectedJob: string | null = null;
  public selectedLocation: string | null = null;
  private activatedRoute = inject(ActivatedRoute);
  // isModal`Open = false;
  selectedCountry = '';
  selectOptions = {
    header: 'Select Country',
  };
  // qty: number = 0;
  // unit: string = '';
  // rate: number = 0;
  // amount: number = 0;

  // calculateAmount() {
  //   this.amount = (this.qty || 0) * (this.rate || 0);
  // }

  constructor(
    private modalCtrl: ModalController,
    private issuevoucher: Issuevoucher,
    private alertController: AlertController,
    private cdr: ChangeDetectorRef,
  ) {
    addIcons({ barcodeOutline, addOutline, receiptOutline, cartOutline });
  }

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id') as string;
    this.getjobDropdown();
  }

  toggleGrid() {
    this.expanded = !this.expanded;
  }

  toggleItem(index: number) {
    this.items[index].expanded = !this.items[index].expanded;
  }

  increaseQty(index: number) {
    this.items[index].quantity++;
  }

  decreaseQty(index: number) {
    if (this.items[index].quantity > 1) this.items[index].quantity--;
  }
  openModal() {
    this.isModalOpen = true;
  }

  // closeModal() {
  //   this.isModalOpen = false;
  // }
  showScanner = false;

  // Modal
  isModalOpen = false;

  // Item Fields
  itemName: string = '';
  qty: number = 1;
  unit: string = '';
  rate: number = 0;
  amount: number = 0;

  // Added Items List
  // items: any[] = [];

  // =====================================
  // OPEN SCANNER
  // =====================================
  async openScanner() {
    this.showScanner = true;

    setTimeout(async () => {
      await this.startScanner();
    }, 300);
  }
  

  // =====================================
  // START SCANNER
  // =====================================
  async startScanner() {
    try {
      const permissions = await BarcodeScanner.checkPermissions();

      if (permissions.camera !== 'granted') {
        const request = await BarcodeScanner.requestPermissions();
        if (request.camera !== 'granted') return;
      }

      const result = await BarcodeScanner.scan();
      const value = result.barcodes?.[0]?.rawValue;

      if (value) {
        this.handleScannedCode(value);
      } else {
        console.warn('No barcode value returned from scanner.');
      }
    } catch (error) {
      console.warn('Scanner not available on this platform:', error);
    } finally {
      this.closeScanner();
    }
  }

  // =====================================
  // HANDLE QR/BARCODE /VALUE
  // =====================================
  handleScannedCode(code: any) {
    console.log('Scanned Raw:', code);

    const scannedValue = typeof code === 'string' ? code.trim() : code;
    const itemId =
      this.extractItemIdFromScannedCode(scannedValue) || scannedValue;
    const itemName =
      this.extractItemNameFromScannedCode(scannedValue) || `${itemId}`;

    if (!itemId) {
      console.warn('No usable product value found in barcode');
      return;
    }

    this.scannedItemId = itemId;
    this.itemName = itemName;
    this.unit = '';
    this.rate = 0;
    this.qty = 1;
    this.amount = 0;
    this.calculateAmount();

    this.showValue(`${itemName} (${itemId})`);
    this.syncScannedDraft();
    this.isModalOpen = true;
    this.cdr.detectChanges();
    this.getItemDetailsById(itemId);
  }

  extractItemNameFromScannedCode(code: any): string | null {
    if (!code) {
      return null;
    }

    let parsed: any = code;

    if (typeof code === 'string') {
      const trimmedCode = code.trim();
      if (!trimmedCode) {
        return null;
      }

      try {
        parsed = JSON.parse(trimmedCode);
      } catch {
        parsed = trimmedCode;
      }
    }

    const directCandidates = [
      parsed?.name,
      parsed?.itemName,
      parsed?.ItemName,
      parsed?.productName,
      parsed?.ProductName,
      parsed?.item_name,
    ];

    const itemName = directCandidates.find((value) => {
      return value !== undefined && value !== null && `${value}`.trim() !== '';
    });

    if (itemName) {
      return `${itemName}`.trim();
    }

    if (typeof parsed === 'string') {
      const structuredMatch = parsed.match(
        /(?:itemname|name)\s*[:=]\s*([^|,;]+)/i,
      );
      if (structuredMatch?.[1]) {
        return structuredMatch[1].trim();
      }

      const parts = parsed
        .split(/[|,;]+/)
        .map((part: string) => part.trim())
        .filter(Boolean);

      if (parts.length > 1) {
        const lastPart = parts[parts.length - 1];
        const maybeId = lastPart.match(/^[A-Za-z0-9._-]+$/);
        if (maybeId) {
          return parts[0];
        }
      }

      return parsed.trim();
    }

    return null;
  }

  extractItemIdFromScannedCode(code: any): string | null {
    if (!code) {
      return null;
    }

    let parsed: any = code;

    if (typeof code === 'string') {
      const trimmedCode = code.trim();

      if (!trimmedCode) {
        return null;
      }

      try {
        parsed = JSON.parse(trimmedCode);
      } catch {
        parsed = trimmedCode;
      }
    }

    const directCandidates = [
      parsed?.itemId,
      parsed?.ItemId,
      parsed?.item_id,
      parsed?.itemID,
      parsed?.id,
      parsed?.ItemID,
    ];

    const itemId = directCandidates.find((value) => {
      return value !== undefined && value !== null && `${value}`.trim() !== '';
    });

    if (itemId) {
      return `${itemId}`.trim();
    }

    if (typeof parsed === 'string') {
      const structuredMatch = parsed.match(
        /(?:itemid|id)\s*[:=]\s*([A-Za-z0-9._-]+)/i,
      );
      if (structuredMatch?.[1]) {
        return structuredMatch[1].trim();
      }

      const parts = parsed
        .split(/[|,;]+/)
        .map((part: string) => part.trim())
        .filter(Boolean);

      if (parts.length > 1) {
        return parts[parts.length - 1];
      }

      return parsed.trim();
    }

    return null;
  }

  // =====================================
  // GET ITEM DETAILS
  // Replace this with your API Call
  // =====================================
  //  getItemDetailsById(code: string) {

  //   // replace with API later
  //   const item = {
  //     name: 'Sugar',
  //     unit: 'Kg',
  //     rate: 150
  //   };

  //   this.itemName = item.name;
  //   this.unit = item.unit;
  //   this.rate = item.rate;
  //   this.qty = 1;

  //   this.calculateAmount();

  //   // 🔥 IMPORTANT: open modal AFTER data set
  //   this.isModalOpen = true;
  // }

  private extractItemPayload(data: any): any {
    const payload = data?.result ?? data;

    if (Array.isArray(payload)) {
      return payload[0] ?? null;
    }

    if (payload?.data && typeof payload.data === 'object') {
      return payload.data;
    }

    return payload;
  }

  private findFirstValue(source: any, keys: string[]): any {
    if (source === undefined || source === null) {
      return undefined;
    }

    if (Array.isArray(source)) {
      for (const item of source) {
        const found = this.findFirstValue(item, keys);
        if (found !== undefined) {
          return found;
        }
      }

      return undefined;
    }

    if (typeof source !== 'object') {
      return undefined;
    }

    const lowerKeys = new Set(keys.map((key) => key.toLowerCase()));

    for (const [key, value] of Object.entries(source)) {
      if (value === undefined || value === null || value === '') {
        continue;
      }

      if (lowerKeys.has(key.toLowerCase())) {
        return value;
      }
    }

    for (const value of Object.values(source)) {
      if (value && typeof value === 'object') {
        const nestedValue = this.findFirstValue(value, keys);
        if (nestedValue !== undefined) {
          return nestedValue;
        }
      }
    }

    return undefined;
  }

  private toNumber(value: any): number {
    if (value === undefined || value === null || value === '') {
      return 0;
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const parsed = Number(value.replace(/[^0-9.\-]/g, ''));
      return Number.isFinite(parsed) ? parsed : 0;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  // =====================================
  // CALCULATE AMOUNT
  // =====================================
  calculateAmount() {
    this.amount = Number(this.qty || 0) * Number(this.rate || 0);
  }

  // =====================================
  // ADD ITEM
  // =====================================
  //   addItem() {

  //   const item = {
  //     name: this.itemName,
  //     unit: this.unit,
  //     quantity: this.qty,
  //     price: this.rate,
  //     amount: this.amount,
  //     expanded: false,
  //     notes: '',
  //     modifiers: ''
  //   };

  //   this.items.push(item);

  //   this.isModalOpen = false;
  // }
  addItem() {
    const newItem: ItemModel = {
      name: this.itemName || 'Unnamed item',
      unit: this.unit,
      quantity: Number(this.qty || 1),
      price: Number(this.rate || 0),
      amount: Number(this.amount || 0),
      expanded: false,
      notes: '',
      modifiers: '',
      itemId: this.scannedItemId || undefined,
    };

    this.items = [...this.items, newItem];
    this.isModalOpen = false;
    this.scannedItem = null;
    this.scannedItemId = null;

    this.itemName = '';
    this.qty = 1;
    this.unit = '';
    this.rate = 0;
    this.amount = 0;

    this.cdr.detectChanges();
    console.log('Added item to grid:', this.items);
  }
  // =====================================
  // CLOSE MODAL
  // =====================================
  closeModal() {
    this.isModalOpen = false;
  }

  // =====================================
  // CLOSE SCANNER
  // =====================================
  closeScanner() {
    this.showScanner = false;
    BarcodeScanner.stopScan();
  }

  // =====================================
  // RESET FORM
  // =====================================
  resetForm() {
    this.itemName = '';
    this.qty = 1;
    this.unit = '';
    this.rate = 0;
    this.amount = 0;
  }

  jobList: any[] = [];

  getjobDropdown() {
    this.issuevoucher.GetJobDropdown().subscribe({
      next: (data: any) => {
        console.log('Job List:', data);

        this.jobList = data.result.map((job: any) => ({
          label: job.name,
          value: job.id,
        }));
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  async showValue(value: any) {
    const alert = await this.alertController.create({
      header: 'Item ID Scanned',
      message: `Item ID: ${value}`,
      buttons: ['OK'],
    });

    await alert.present();
  }
  getItemDetailsById(code: any) {
    this.issuevoucher.getItemDetailsById(code).subscribe({
      next: (data: any) => {
        console.log('Item Details API Response:', data);

        const item = this.extractItemPayload(data);
        const itemName =
          this.findFirstValue(item, [
            'name',
            'itemName',
            'ItemName',
            'productName',
            'ProductName',
            'item_name',
            'itemDescription',
            'description',
            'itemMasterName',
          ]) || '';
        const unit =
          this.findFirstValue(item, [
            'unit',
            'unitName',
            'unit_name',
            'uom',
            'uomName',
            'measurementUnit',
            'saleUnit',
          ]) || '';
        const rateValue = this.findFirstValue(item, [
          'rate',
          'Rate',
          'price',
          'Price',
          'sellingPrice',
          'selling_price',
          'salesPrice',
          'sales_price',
          'unitPrice',
          'unit_price',
          'salePrice',
          'sale_price',
          'itemRate',
          'item_rate',
          'saleRate',
          'sale_rate',
          'mrp',
          'listPrice',
        ]);
        const amountValue = this.findFirstValue(item, [
          'amount',
          'Amount',
          'lineAmount',
          'line_amount',
          'netAmount',
          'net_amount',
          'grossAmount',
          'gross_amount',
          'totalAmount',
          'total_amount',
          'netPrice',
          'net_price',
        ]);
        const resolvedRate =
          this.toNumber(rateValue) || this.toNumber(amountValue);
        const resolvedAmount = this.toNumber(amountValue) || resolvedRate;

        this.itemName = itemName || this.itemName;
        this.unit = unit || this.unit;
        this.rate = resolvedRate;
        this.qty = 1;
        this.amount = resolvedAmount;

        this.calculateAmount();
        this.syncScannedDraft();
        this.isModalOpen = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('API Error:', err);
      },
    });
  }

  private syncScannedDraft() {
    const itemId = this.scannedItemId || '';
    this.scannedItem = {
      name: this.itemName || 'Unnamed item',
      unit: this.unit,
      quantity: Number(this.qty || 1),
      price: Number(this.rate || 0),
      amount: Number(this.amount || 0),
      expanded: false,
      notes: '',
      modifiers: '',
      itemId: itemId || undefined,
    };


    this.cdr.detectChanges();
  }
}
