import {Component, OnInit} from '@angular/core';
import {server} from '../../services/server';
import {NgxSpinnerService} from 'ngx-spinner';
import {AlertifyService} from '../../services/alertify/alertify.service';
import {AuthService} from '../../services/auth/auth.service';
import {Degree} from './degree.model';
import {RequestPayload} from '../../shared/request-payload.model';

@Component({
  selector: 'app-degree',
  templateUrl: './degree.component.html',
  styleUrls: ['./degree.component.scss']
})
export class DegreeComponent implements OnInit {

  count: number;
  activePage: any;
  currentPage: number;
  requestPayload: RequestPayload;
  degree: Degree;
  degreeList: any = [];

  constructor(private spinner: NgxSpinnerService,
              private authService: AuthService,
              private alertify: AlertifyService) {

    this.degree = new Degree();
    this.requestPayload = new RequestPayload();
  }

  ngOnInit() {
    this.getDegrees(1);
  }

  getDegrees(pageNo) {
    this.spinner.show();
    const offset = (pageNo - 1) * this.requestPayload.limit;
    this.authService.ServerGet(server.degree +
      `/?limit=${this.requestPayload.limit}&offset=${offset}&search=${this.requestPayload.valueOfSearch}`)
      .subscribe((res: any = []) => {
        this.degreeList = res.result;
        this.activePage = pageNo;
        this.count = res.count;
      }, err => {
        if (err.status >= 400 || err.status < 500) {
          this.alertify.warning(err.error.detail);
        }
        this.spinner.hide();
      }, () => {
        this.spinner.hide();
      });
  }

  viewAddDegree() {
    this.degree = new Degree();
  }

  getSelectedDegree(degreeId, requestReference) {

    this.authService.ServerGet(server.viewDegree + '/?degreeId=' + degreeId)
      .subscribe((res: any = []) => {
        this.degree = res;
      }, err => {
        if (err.status >= 400 || err.status < 500) {
          this.alertify.warning(err.error.detail);
        }
        this.spinner.hide();
      }, () => {
        if (requestReference === 'edit') {
          // @ts-ignore
          $('#editDegree').modal('show');
        } else {
          // @ts-ignore
          $('#deleteDegree').modal('show');
        }
        this.spinner.hide();
      });
  }

  search(searchValue) {
    this.requestPayload.valueOfSearch = searchValue;
    this.getDegrees(1);
  }

  pagination(pageNo) {
    this.getDegrees(pageNo);
  }

  addDegree() {
    this.spinner.show();

    const obj = {
      degree: this.degree.name
    };
    this.authService.ServerPost(server.addDegree, obj)
      .subscribe((res: any = []) => {
        this.alertify.success(res.detail);
      }, err => {
        if (err.status >= 400 || err.status < 500) {
          this.alertify.warning(err.error.detail);
        }
        this.spinner.hide();
      }, () => {
        // @ts-ignore
        $('#addDegree').modal('hide');
        this.pagination(1);
        this.spinner.hide();
      });
  }

  editDegree() {

    const obj = {
      degree: this.degree.name,
      degreeId: this.degree.id
    };

    this.authService.ServerPost(server.viewDegree, obj)
      .subscribe((res: any = []) => {
        this.alertify.success(res.detail);
      }, err => {
        if (err.status >= 400 || err.status < 500) {
          this.alertify.warning(err.error.detail);
        }
        this.spinner.hide();
      }, () => {
        // @ts-ignore
        $('#editDegree').modal('hide');
        this.pagination(1);
        this.spinner.hide();
      });
  }

  deleteDegree() {
    this.spinner.show();
    const obj = {
      degreeId: this.degree.id
    };

    this.authService.ServerPost(server.deleteDegree, obj)
      .subscribe((res: any = []) => {
        this.alertify.success(res.detail);
      }, err => {
        if (err.status >= 400 || err.status < 500) {
          this.alertify.warning(err.error.detail);
        }
        this.spinner.hide();
      }, () => {
        // @ts-ignore
        $('#deleteDegree').modal('hide');
        this.pagination(1);
        this.spinner.hide();
      });
  }
}
