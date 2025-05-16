import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SegnalazioniPageComponent } from './segnalazioni-page.component';

describe('SegnalazioniPageComponent', () => {
  let component: SegnalazioniPageComponent;
  let fixture: ComponentFixture<SegnalazioniPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SegnalazioniPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SegnalazioniPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
