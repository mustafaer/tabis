import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../services/auth/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  userType: number;
  constructor(private authService: AuthService, private router: Router) {
    this.userType = this.authService.CheckAccess();
  }

  ngOnInit() {
  }

}
