import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BotScheduleComponent } from './bot-schedule.component';

describe('BotScheduleComponent', () => {
  let component: BotScheduleComponent;
  let fixture: ComponentFixture<BotScheduleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BotScheduleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BotScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
