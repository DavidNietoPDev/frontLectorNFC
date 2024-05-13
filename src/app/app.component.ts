import { Component, OnInit, inject } from '@angular/core';
import { ModoOscuroService } from './services/modo-oscuro.service';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'sistemaParseo';
  ModoOscuroService = inject(ModoOscuroService);
     
toggleDarkMode() {
  this.ModoOscuroService.toggleDarkMode();
}

ngOnInit() {
  document.body.classList.add('dark-mode');
  }
}



