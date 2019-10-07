import { Component, OnInit } from '@angular/core';
import {server} from '../../services/server';
import {NgxSpinnerService} from 'ngx-spinner';
import {AlertifyService} from '../../services/alertify/alertify.service';
import {AuthService} from '../../services/auth/auth.service';
import {DegreeModel} from './degreeModel';

@Component({
  selector: 'app-degree',
  templateUrl: './degree.component.html',
  styleUrls: ['./degree.component.scss']
})
export class DegreeComponent implements OnInit {

  degrees: any;
  count: number;
  activePage: any;
  limit: number;
  currentPage: number;
  valueOfSearch: string;
  orderByValue: string;
  degree: DegreeModel;
  degreeId: number;

  constructor(private spinner: NgxSpinnerService,
              private authService: AuthService,
              private alertify: AlertifyService) {
    this.limit = 15;
    this.valueOfSearch = '';
    this.orderByValue = 'id';
  }

  ngOnInit() {
    this.getDegrees(1);
  }

  getDegrees(pageNo) {
    this.degrees = [];
    this.spinner.show();
    const offset = (pageNo - 1) * this.limit;
    this.authService.ServerGet(server.degree + '/?limit=' + this.limit + '&offset=' + offset + '&search=' + this.valueOfSearch)
      .subscribe(res => {
        // @ts-ignore
        this.degrees = res.result;
        this.activePage = pageNo;
        // @ts-ignore
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

  getSelectedDegree(degreeId, requestReference) {

    this.authService.ServerGet(server.viewDegree + '/?degreeId=' + degreeId)
      .subscribe(res => {
        // @ts-ignore
        this.degree = res;
        this.degreeId = this.degree.id;
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
    this.degrees = [];
    this.valueOfSearch = searchValue;
    this.getDegrees(1);
  }

  pagination(pageNo) {
    this.getDegrees(pageNo);
  }

  addDegree(degree) {
    this.spinner.show();

    const obj = {
      degree
    };
    this.authService.ServerPost(server.addDegree, obj)
      .subscribe(res => {
        // @ts-ignore
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

  editDegree(degree) {

    const obj = {
      degree: degree,
      degreeId: this.degreeId
    };

    this.authService.ServerPost(server.viewDegree, obj)
      .subscribe(res => {
        // @ts-ignore
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
      degreeId: this.degreeId
    };

    this.authService.ServerPost(server.deleteDegree, obj)
      .subscribe(res => {
        // @ts-ignore
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
