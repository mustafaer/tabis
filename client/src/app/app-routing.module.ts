import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeLayoutComponent} from './shared/layouts/home-layout/home-layout.component';
import {LoginLayoutComponent} from './shared/layouts/login-layout/login-layout.component';
import {LoginComponent} from './components/login/login.component';
import {DashboardComponent} from './components/dashboard/dashboard.component';
import {PasswordRequestComponent} from './components/password-request/password-request.component';
import {PasswordResetComponent} from './components/password-reset/password-reset.component';
import {DegreeComponent} from './components/degree/degree.component';
import {StudyBranchComponent} from './components/study-branch/study-branch.component';
import {StudentComponent} from './components/student/student.component';

const routes: Routes = [{
  path: '', component: LoginLayoutComponent,
  children: [
    {
      path: '', component: LoginComponent
    },
    {
      path: 'login', component: LoginComponent
    },
    {
      path: 'password-request', component: PasswordRequestComponent
    },
    {
      path: 'password-reset', component: PasswordResetComponent
    }
  ]
},
  {
    path: 'dashboard', component: HomeLayoutComponent,
    children: [
      {
        path: '', component: DashboardComponent, pathMatch: 'full'
      },
      {
        path: 'degree', component: DegreeComponent
      },
      {
        path: 'study-branch', component: StudyBranchComponent
      },
      {
        path: 'student', component: StudentComponent
      }
    ]
  },
  {
    path: '**', redirectTo: 'dashboard'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
