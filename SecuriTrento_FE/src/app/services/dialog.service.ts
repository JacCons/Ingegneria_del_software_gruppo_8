import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogContentComponent } from '../components/dialog-component/dialog-component.component';
import { Observable } from 'rxjs';


export interface DialogData { //template dati dialog
  title: string;
  message: string;
  confirmButton?: string;
  cancelButton?: string;
}

@Injectable({
  providedIn: 'root'
})

export class DialogService {
  private dialog = inject(MatDialog);

  showSuccess(message: string): void {
    this.openDialog({
      title: 'Operazione completata',
      message: message,
      confirmButton: 'OK'
    });
  }

  showError(message: string): void {
    this.openDialog({
      title: 'Errore',
      message: message,
      confirmButton: 'Chiudi',

    });
  }

  showCustom(title: string, message: string, buttonTextConfirm: string = 'OK', buttonTextCancel: string = 'Annulla'): Observable<string|undefined> {
    const dialogRef = this.dialog.open(DialogContentComponent, {
      width: '300px',
      data: {
        title: title,
        message: message,
        confirmButton: buttonTextConfirm,
        cancelButton: buttonTextCancel
      }
    });

    return dialogRef.afterClosed(); 
  }

  private openDialog(data: DialogData): Observable<string|undefined> {
    const dialogRef = this.dialog.open(DialogContentComponent, {
      width: '300px',
      data: data
    });
    
    return dialogRef.afterClosed();
  }
}
