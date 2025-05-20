import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotifichePageComponent } from './notifiche-page.component';

describe('NotifichePageComponent', () => {
  let component: NotifichePageComponent;
  let fixture: ComponentFixture<NotifichePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotifichePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotifichePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
