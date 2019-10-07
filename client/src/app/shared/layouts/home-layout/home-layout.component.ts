import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../../services/auth/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-home-layout',
  templateUrl: './home-layout.component.html',
  styleUrls: ['./home-layout.component.scss']
})
export class HomeLayoutComponent implements OnInit {

  public _opened = false;

  public _toggleSidebar() {
    this._opened = !this._opened;
  }

  constructor(private authService: AuthService, private router: Router) {
    this.checkToken();
  }

  ngOnInit() {
  }

  checkToken() {
    const token = this.authService.token();
    if (token === null) {
      this.router.navigate(['/login']);
    }
  }
}
