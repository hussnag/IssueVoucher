import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-code-sanner',
  templateUrl: './code-sanner.component.html',
  styleUrls: ['./code-sanner.component.scss'],
    imports: [
    CommonModule,
    IonicModule   // ✅ THIS FIXES ion-* errors
  ]
})
export class CodeSannerComponent implements OnInit, OnDestroy {
  scanResult: string = '';

  constructor() {}

  ngOnInit(): void {}
  showScanner = false;

  openScanner() {
    this.showScanner = true;

    // Start QR scanner here
    // await BarcodeScanner.scan();
  }

  closeScanner() {
    this.showScanner = false;

    // Stop scanner here if needed
  }
  // async checkPermission() {
  //   const status = await BarcodeScanner.checkPermission({ force: true });

  //   if (status.granted) {
  //     return true;
  //   }

  //   return false;
  // }

  // async startScan() {

  //   const permission = await this.checkPermission();

  //   if (!permission) {
  //     alert('Camera permission is required');
  //     return;
  //   }

  //   document.body.classList.add('scanner-active');

  //   await BarcodeScanner.hideBackground();

  //   const result = await BarcodeScanner.startScan();

  //   if (result?.hasContent) {
  //     this.scanResult = result.content;
  //   }

  //   this.stopScan();
  // }

  // stopScan() {
  //   BarcodeScanner.showBackground();
  //   BarcodeScanner.stopScan();

  //   document.body.classList.remove('scanner-active');
  // }

  ngOnDestroy(): void {
   }
}
