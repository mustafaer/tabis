import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyBranchComponent } from './study-branch.component';

describe('StudyBranchComponent', () => {
  let component: StudyBranchComponent;
  let fixture: ComponentFixture<StudyBranchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudyBranchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyBranchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
