import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { IonicModule, MenuController } from '@ionic/angular';
import { filter } from 'rxjs/operators';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
 imports: [
  CommonModule,
  // RouterOutlet,
  IonicModule
]
})
export class AppComponent {
  
    showMenu = true;

  public appPages = [
    { title: 'Inbox', url: '/folder/inbox', icon: 'mail' },
    { title: 'Outbox', url: '/folder/outbox', icon: 'paper-plane' },
    { title: 'Favorites', url: '/folder/favorites', icon: 'heart' },
    { title: 'Archived', url: '/folder/archived', icon: 'archive' },
    { title: 'Trash', url: '/folder/trash', icon: 'trash' },
    { title: 'Spam', url: '/folder/spam', icon: 'warning' },
  ];

  public labels = ['Family', 'Friends', 'Notes', 'Work'];

  constructor(
    private router: Router,
    private menuCtrl: MenuController
  ) {

    this.router.events
      .pipe(
        filter((event: any) => event instanceof NavigationEnd)
      )
      .subscribe((event: NavigationEnd) => {

        this.showMenu = !event.url.includes('/auth/login');

      });
  }

  async logout() {

    await this.menuCtrl.close();
    await this.menuCtrl.enable(false);

    this.router.navigateByUrl('/auth/login', {
      replaceUrl: true
    });
  }
}
