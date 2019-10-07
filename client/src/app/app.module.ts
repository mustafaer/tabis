import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HomeLayoutComponent } from './shared/layouts/home-layout/home-layout.component';
import { LoginLayoutComponent } from './shared/layouts/login-layout/login-layout.component';
import { TranslatePipe } from './pipes/translate/translate.pipe';
import {AppRoutingModule} from './app-routing.module';
import {NgxPaginationModule} from 'ngx-pagination';
import {NgxSpinnerModule} from 'ngx-spinner';
import {SidebarModule} from 'ng-sidebar';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {AlertifyService} from './services/alertify/alertify.service';
import {AuthService} from './services/auth/auth.service';
import {TranslateService} from './services/translate/translate.service';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import {TRANSLATION_PROVIDERS} from './services/translate';
import { PasswordResetComponent } from './components/password-reset/password-reset.component';
import { PasswordRequestComponent } from './components/password-request/password-request.component';
import { DegreeComponent } from './components/degree/degree.component';
import { StudyBranchComponent } from './components/study-branch/study-branch.component';
import { StudentComponent } from './components/student/student.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeLayoutComponent,
    LoginLayoutComponent,
    TranslatePipe,
    LoginComponent,
    DashboardComponent,
    FooterComponent,
    HeaderComponent,
    SidebarComponent,
    PasswordResetComponent,
    PasswordRequestComponent,
    DegreeComponent,
    StudyBranchComponent,
    StudentComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    NgxPaginationModule,
    SidebarModule.forRoot(),
    NgxSpinnerModule
  ],
  providers: [AuthService, AlertifyService, TranslatePipe, TranslateService, TRANSLATION_PROVIDERS, NgxSpinnerModule],
  bootstrap: [AppComponent]
})
export class AppModule { }
