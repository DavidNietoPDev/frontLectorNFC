import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModoOscuroService {
  darkModeEnabled: boolean = true;

  toggleDarkMode() {
    this.darkModeEnabled = !this.darkModeEnabled;
    if (this.darkModeEnabled) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }
}
