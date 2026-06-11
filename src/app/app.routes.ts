import { Routes } from '@angular/router';

export const routes: Routes = [
 
  {
    path: 'folder/:id',
    loadComponent: () =>
      import('./folder/folder.page').then((m) => m.FolderPage),
  },
   {
    path: 'folder2',
    loadComponent: () =>
      import('./folder2/folder2.component').then((m) => m.Folder2Component),
  },
  {
    path: 'codesanner',
    loadComponent: () =>
      import('./code-sanner/code-sanner.component').then((m) => m.CodeSannerComponent),
  },
 {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },

  {
    path: 'auth',
    loadChildren: () =>
      import('./auth/auth.routes')
        .then((m) => m.routes),
  },

];
