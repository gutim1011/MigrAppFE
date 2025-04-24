import { Component } from '@angular/core';
import { CoreService } from 'src/app/services/core.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth.service';
import { OtpModalComponent } from '../../../components/otp-modal/otp-modal.component';

@Component({
  selector: 'app-side-login',
  standalone: true,
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule],
  templateUrl: './side-login.component.html',
})
export class AppSideLoginComponent {
  options = this.settings.getOptions();

  constructor(
    private settings: CoreService,
    private router: Router,
    private authService: AuthService,
    public dialog: MatDialog
  ) {}

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    rememberMe: new FormControl(false),
  });

  get f() {
    return this.form.controls;
  }

  submit() {
    if (this.form.invalid) {
      alert('Por favor, completa todos los campos correctamente.');
      return;
    }

    const loginData = {
      Email: this.form.value.email!,
      Password: this.form.value.password!,
      PreferredMfaMethod: 'email',
      RememberMe: this.form.value.rememberMe!,
    };

    this.authService.login(loginData).subscribe(
      (res: any) => {
        if (res?.message === 'Código de verificación enviado') {
          const dialogRef = this.dialog.open(OtpModalComponent, {
            width: '400px',
            data: { email: loginData.Email, rememberMe: loginData.RememberMe },
          });

          dialogRef.afterClosed().subscribe((success: boolean) => {
            if (success) {
              this.router.navigate(['/user-dashboard']);
            }
          });
        } else {
          alert('No se pudo enviar el código de verificación');
        }
      },
      (error) => {
        alert('Error al iniciar sesión');
        console.error(error);
      }
    );
  }
}
