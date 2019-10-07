import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  public toggleSidebar() {
    document.getElementById('toggle_sidebar_button').click();
  }


  constructor(private authService: AuthService) {
  }

  ngOnInit() {
  }

  logOut() {
    // clear sessionsStorage, localeStorage and go login page
    this.authService.ServerLogout();
  }

}
