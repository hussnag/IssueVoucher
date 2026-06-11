import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-folder2',
  templateUrl: './folder2.component.html',
  styleUrls: ['./folder2.component.scss'],
    imports: [
      CommonModule,
    IonicModule
  ]
})
export class Folder2Component  implements OnInit {

constructor(private modalCtrl: ModalController) {}

  closeModal() {
    this.modalCtrl.dismiss();
  }
  ngOnInit() {}

}
