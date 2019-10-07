import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'TABİS';

  constructor() {
    AppComponent.setLanguage();
  }

  static setLanguage() {
    if (!localStorage.getItem('lang')) {
      localStorage.setItem('lang', 'tr');
    }
  }
}
