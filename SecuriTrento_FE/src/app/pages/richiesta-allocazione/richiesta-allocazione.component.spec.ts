import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RichiestaAllocazioneComponent } from './richiesta-allocazione.component';

describe('RichiestaAllocazioneComponent', () => {
  let component: RichiestaAllocazioneComponent;
  let fixture: ComponentFixture<RichiestaAllocazioneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RichiestaAllocazioneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RichiestaAllocazioneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
