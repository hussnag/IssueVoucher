import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule,FormsModule],
})
export class LoginComponent implements OnInit {
  selectedLocation: string = '';
  constructor(private router: Router) {}

  login() {
    this.router.navigate(['/folder/:id']);
  }
  ngOnInit() {}
}
