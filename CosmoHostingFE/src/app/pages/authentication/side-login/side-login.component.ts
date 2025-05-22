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
import { TextToSpeechService } from 'src/app/services/text-to-speech.service';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';



@Component({
  selector: 'app-side-login',
  standalone: true,
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule,CommonModule,TranslateModule,],
  templateUrl: './side-login.component.html',
})
export class AppSideLoginComponent {
  options = this.settings.getOptions();

  constructor(
    private settings: CoreService,
    private router: Router,
    private authService: AuthService,
    public dialog: MatDialog,
    private tts: TextToSpeechService,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {}

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    rememberMe: new FormControl(false),
  });

  get f() {
    return this.form.controls;
  }

  leer(texto: string) {
    console.log("leyenod",texto)
    this.tts.speak(texto);
  }

  submit() {
    if (this.form.invalid) {
      this.toastr.warning(
        this.translate.instant('LOGIN.INVALID_FORM'),
        this.translate.instant('LOGIN.WARNING')
      );
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
        if (res?.message === 'Código de verificaciï¿½n enviado') {
          const dialogRef = this.dialog.open(OtpModalComponent, {
            width: '400px',
            data: { email: loginData.Email, rememberMe: loginData.RememberMe },
          });

          dialogRef.afterClosed().subscribe((success: boolean) => {
            if (success) {
              this.toastr.success(
                this.translate.instant('LOGIN.SUCCESS_MESSAGE'),
                this.translate.instant('LOGIN.WELCOME')
              );
              this.router.navigate(['/user-dashboard']);
            } else {
              this.toastr.info(
                this.translate.instant('LOGIN.OTP_CANCELLED'),
                this.translate.instant('LOGIN.INTERRUPTED')
              );
            }
          });
        } else {
          this.toastr.error(
            this.translate.instant('LOGIN.OTP_FAILED'),
            this.translate.instant('LOGIN.ERROR')
          );
        }
      },
      (error) => {
        this.toastr.error(
          this.translate.instant('LOGIN.LOGIN_FAILED'),
          this.translate.instant('LOGIN.ERROR')
        );
        console.error(error);
      }
    );
  }
}
