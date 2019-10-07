import { Component, OnInit } from '@angular/core';
import {StudentModel} from '../student/studentModel';
import {NgxSpinnerService} from 'ngx-spinner';
import {AuthService} from '../../services/auth/auth.service';
import {AlertifyService} from '../../services/alertify/alertify.service';
import {server} from '../../services/server';

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.scss']
})
export class StudentComponent implements OnInit {

  students: any;
  count: number;
  activePage: any;
  limit: number;
  currentPage: number;
  valueOfSearch: string;
  orderByValue: string;
  student: StudentModel;
  studentId: number;

  constructor(private spinner: NgxSpinnerService,
              private authService: AuthService,
              private alertify: AlertifyService) {
    this.limit = 15;
    this.valueOfSearch = '';
    this.orderByValue = 'id';
  }

  ngOnInit() {
    this.getStudents(1);
  }

  getStudents(pageNo) {
    this.students = [];
    this.spinner.show();
    const offset = (pageNo - 1) * this.limit;
    this.authService.ServerGet(server.student + '/?limit=' + this.limit + '&offset=' + offset + '&search=' + this.valueOfSearch)
      .subscribe(res => {
        // @ts-ignore
        this.students = res.result;
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

  getSelectedStudent(studentId, requestReference) {

    this.authService.ServerGet(server.viewStudent + '/?studentId=' + studentId)
      .subscribe(res => {
        // @ts-ignore
        this.student = res;
        this.studentId = this.student.id;
      }, err => {
        if (err.status >= 400 || err.status < 500) {
          this.alertify.warning(err.error.detail);
        }
        this.spinner.hide();
      }, () => {
        if (requestReference === 'edit') {
          // @ts-ignore
          $('#editStudent').modal('show');
        } else {
          // @ts-ignore
          $('#deleteStudent').modal('show');
        }
        this.spinner.hide();
      });
  }

  search(searchValue) {
    this.students = [];
    this.valueOfSearch = searchValue;
    this.getStudents(1);
  }

  pagination(pageNo) {
    this.getStudents(pageNo);
  }

  addStudent(student) {
    this.spinner.show();

    const obj = {
      student
    };
    this.authService.ServerPost(server.addStudent, obj)
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
        $('#addStudent').modal('hide');
        this.pagination(1);
        this.spinner.hide();
      });
  }

  editStudent(student) {

    const obj = {
      student: student,
      studentId: this.studentId
    };

    this.authService.ServerPost(server.viewStudent, obj)
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
        $('#editStudent').modal('hide');
        this.pagination(1);
        this.spinner.hide();
      });
  }

  deleteStudent() {
    this.spinner.show();
    const obj = {
      studentId: this.studentId
    };

    this.authService.ServerPost(server.deleteStudent, obj)
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
        $('#deleteStudent').modal('hide');
        this.pagination(1);
        this.spinner.hide();
      });
  }
}
