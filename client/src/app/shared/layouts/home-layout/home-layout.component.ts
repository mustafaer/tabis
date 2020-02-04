import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../../services/auth/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-home-layout',
  templateUrl: './home-layout.component.html',
  styleUrls: ['./home-layout.component.scss']
})
export class HomeLayoutComponent implements OnInit {

  // tslint:disable-next-line:variable-name
  public _opened = true;

  constructor(private authService: AuthService, private router: Router) {
    this.checkToken();
  }

  public _toggleSidebar() {
    this._opened = !this._opened;
    localStorage.setItem('sidebarIsOpen', String(this._opened));
  }

  ngOnInit() {
    const isOpened = localStorage.getItem('sidebarIsOpen');
    const isTrueSet = (isOpened === 'true');
    if (isOpened && [true, false].includes(isTrueSet)) {
      this._opened = isTrueSet;
    } else {
      this._opened = true;
    }
  }

  checkToken() {
    const token = this.authService.getToken();
    if (token === null) {
      this.router.navigate(['/login']);
    }
  }
}
