import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../../services/auth/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login-layout',
  templateUrl: './login-layout.component.html',
  styleUrls: ['./login-layout.component.scss']
})
export class LoginLayoutComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router) {
    this.checkToken();
  }

  ngOnInit() {
  }

  checkToken() {
    const token = this.authService.getToken();
    if (token !== null) {
      this.router.navigate(['/dashboard']);
    }
  }
}
