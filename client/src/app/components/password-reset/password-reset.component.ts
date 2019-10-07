import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth/auth.service';
import {server} from '../../services/server';
import {AlertifyService} from '../../services/alertify/alertify.service';
import {NgxSpinnerService} from 'ngx-spinner';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent implements OnInit {

  passwordIsSame: boolean;

  constructor(private spinner: NgxSpinnerService,
              private authService: AuthService,
              private router: Router,
              private alertify: AlertifyService) {
    this.passwordIsSame = false;
  }

  ngOnInit() {
    this.spinner.show();

    const url = new URL(window.location.href);
    const hash = url.searchParams.get('token');

    this.authService.ServerGetLogin(server.passwordReset + '/?token=' + hash)
      .subscribe(res => {
        // @ts-ignore
        this.alertify.success(res.detail);
      }, err => {
        if (err.status >= 400 || err.status < 500) {
          this.router.navigate(['/']);
          this.alertify.warning(err.error.detail);
        }
        this.spinner.hide();
      }, () => {
        this.spinner.hide();
      });
  }

  passwordValidate(newPassword, newPasswordRepeat) {

    this.passwordIsSame = newPassword === newPasswordRepeat;
  }

  passwordReset(newPassword, newPasswordRepeat) {
    this.spinner.show();
    const url = new URL(window.location.href);
    const hash = url.searchParams.get('token');
    let obj = {
      newPassword, newPasswordRepeat, token: hash
    };
    this.authService.ServerPostLogin(server.passwordReset, obj)
      .subscribe(res => {
        // @ts-ignore
        this.alertify.success(res.detail);
      }, err => {
        if (err.status >= 400 || err.status < 500) {
          this.alertify.warning(err.error.detail);
        }
        this.spinner.hide();
      }, () => {
        this.router.navigate(['/']);
        this.spinner.hide();
      });
  }
}
