import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth/auth.service';
import {server} from '../../services/server';
import {AlertifyService} from '../../services/alertify/alertify.service';
import {NgxSpinnerService} from 'ngx-spinner';

@Component({
  selector: 'app-password-request',
  templateUrl: './password-request.component.html',
  styleUrls: ['./password-request.component.scss']
})
export class PasswordRequestComponent implements OnInit {

  emailVal: any;

  constructor(private spinner: NgxSpinnerService,
              private authService: AuthService,
              private router: Router,
              private alertify: AlertifyService) {
  }

  ngOnInit() {
  }

  emailValidate(email) {
    console.log(email);
    const pattern = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    this.emailVal = !!email.match(pattern);
  }

  passwordRequest(email) {
    let obj = {
      email
    };
    this.spinner.show();
    this.authService.ServerPostLogin(server.passwordRequest, obj)
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
