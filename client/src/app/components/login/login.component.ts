import {Component, OnInit} from '@angular/core';
import {server} from '../../services/server';
import {AlertifyService} from '../../services/alertify/alertify.service';
import {AuthService} from '../../services/auth/auth.service';
import {Router} from '@angular/router';
import {NgxSpinnerService} from "ngx-spinner";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  token: string;
  userType: number;
  isFilled: boolean;

  constructor(private spinner: NgxSpinnerService,
              private authService: AuthService,
              private router: Router,
              private alertify: AlertifyService) {
    this.isFilled = false;
  }

  ngOnInit() {
  }

  confirmFilled(username, password) {
    this.isFilled = username.trim() != '' && password.trim() != '';
  }

  login(username, password) {

    this.spinner.show();
    let obj = {
      username, password
    };
    this.authService.ServerPostLogin(server.login, obj).subscribe(res => {
      this.token = res['token'];
      this.userType = JSON.parse(window.atob((this.token).split('.')[1])).userType;
      if (this.token) {
        this.authService.saveToken(this.token);
        if (this.userType === 0) {
          sessionStorage.setItem('Role', 'AA'); // application admin
          this.router.navigate(['/home']);
        } else if (this.userType === 1) {
          sessionStorage.setItem('Role', 'A'); // advisor
          this.router.navigate(['/home']);
        } else if (this.userType === 2) {
          sessionStorage.setItem('Role', 'GU'); // general user
          this.router.navigate(['/home']);
        } else {
          this.alertify.error('Connection Error');
        }
      }
    }, err => {
      if (err.status >= 400 || err.status < 500) {
        this.alertify.error(err.error.detail);
        this.spinner.hide();
      }
    }, () => {
      this.spinner.hide();
    });
  }

}
