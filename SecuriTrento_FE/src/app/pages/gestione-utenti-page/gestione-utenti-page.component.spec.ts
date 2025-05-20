import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestioneUtentiPageComponent } from './gestione-utenti-page.component';

describe('GestioneUtentiPageComponent', () => {
  let component: GestioneUtentiPageComponent;
  let fixture: ComponentFixture<GestioneUtentiPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestioneUtentiPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestioneUtentiPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
