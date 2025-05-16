import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatButtonModule, MatButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  selector: 'login-page',
  imports: [MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatTooltip, MatButton, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})

export class LoginPageComponent {
  //variabili di support
  hide = signal(true);
  
  cellularPhone: string = "";
  password: string = "";

  constructor(
    private router: Router
  ){}

  ngOnInit(): void{
  }

  //pulsante mostra/nascondi password
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  clickAccedi(event: MouseEvent){
    console.log("ho cliccato accedi");
    this.router.navigate(['/segnalazioni']);
  }

  clickRegistrati(event: MouseEvent){
    console.log("Ho registrato");
    console.log(this.cellularPhone);
    console.log(this.password)
  }
  
  checkLoginNotEmpty(){
    return !this.cellularPhone || !this.password;
  }
}
