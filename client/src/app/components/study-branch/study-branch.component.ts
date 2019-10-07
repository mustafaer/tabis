import {Component, OnInit} from '@angular/core';
import {StudyBranchModel} from './studyBranchModel';
import {NgxSpinnerService} from 'ngx-spinner';
import {AuthService} from '../../services/auth/auth.service';
import {AlertifyService} from '../../services/alertify/alertify.service';
import {server} from '../../services/server';

@Component({
  selector: 'app-study-branch',
  templateUrl: './study-branch.component.html',
  styleUrls: ['./study-branch.component.scss']
})
export class StudyBranchComponent implements OnInit {

  studyBranches: any;
  count: number;
  activePage: any;
  limit: number;
  currentPage: number;
  valueOfSearch: string;
  orderByValue: string;
  studyBranch: StudyBranchModel;
  studyBranchId: number;

  constructor(private spinner: NgxSpinnerService,
              private authService: AuthService,
              private alertify: AlertifyService) {
    this.limit = 15;
    this.valueOfSearch = '';
    this.orderByValue = 'id';
  }

  ngOnInit() {
    this.getStudyBranchs(1);
  }

  getStudyBranchs(pageNo) {
    this.studyBranches = [];
    this.spinner.show();
    const offset = (pageNo - 1) * this.limit;
    this.authService.ServerGet(server.studyBranch + '/?limit=' + this.limit + '&offset=' + offset + '&search=' + this.valueOfSearch)
      .subscribe(res => {
        // @ts-ignore
        this.studyBranches = res.result;
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

  getSelectedStudyBranch(studyBranchId, requestReference) {

    this.authService.ServerGet(server.viewStudyBranch + '/?studyBranchId=' + studyBranchId)
      .subscribe(res => {
        // @ts-ignore
        this.studyBranch = res;
        this.studyBranchId = this.studyBranch.id;
      }, err => {
        if (err.status >= 400 || err.status < 500) {
          this.alertify.warning(err.error.detail);
        }
        this.spinner.hide();
      }, () => {
        if (requestReference === 'edit') {
          // @ts-ignore
          $('#editStudyBranch').modal('show');
        } else {
          // @ts-ignore
          $('#deleteStudyBranch').modal('show');
        }
        this.spinner.hide();
      });
  }

  search(searchValue) {
    this.studyBranches = [];
    this.valueOfSearch = searchValue;
    this.getStudyBranchs(1);
  }

  pagination(pageNo) {
    this.getStudyBranchs(pageNo);
  }

  addStudyBranch(studyBranch) {
    this.spinner.show();

    const obj = {
      studyBranch
    };
    this.authService.ServerPost(server.addStudyBranch, obj)
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
        $('#addStudyBranch').modal('hide');
        this.pagination(1);
        this.spinner.hide();
      });
  }

  editStudyBranch(studyBranch) {

    const obj = {
      studyBranch: studyBranch,
      studyBranchId: this.studyBranchId
    };

    this.authService.ServerPost(server.viewStudyBranch, obj)
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
        $('#editStudyBranch').modal('hide');
        this.pagination(1);
        this.spinner.hide();
      });
  }

  deleteStudyBranch() {
    this.spinner.show();
    const obj = {
      studyBranchId: this.studyBranchId
    };

    this.authService.ServerPost(server.deleteStudyBranch, obj)
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
        $('#deleteStudyBranch').modal('hide');
        this.pagination(1);
        this.spinner.hide();
      });
  }
}
