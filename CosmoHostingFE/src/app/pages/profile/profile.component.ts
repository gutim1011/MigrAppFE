import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from 'src/app/services/auth.service';

import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-complete-profile',
  imports: [
    CommonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class CompleteProfileComponent {
  fb = inject(FormBuilder);
  userService = inject(AuthService);

  profileForm = this.fb.group({
    name: ['', Validators.required],
    lastName: ['', Validators.required],
    phonePrefix: ['+57'],
    phone: ['', Validators.required],
    country: [''],
    birthDate: ['']
  });

  isEditMode = false;
  hasInfo = false;
  userId: number = 0;

  ngOnInit() {
    const storedId = localStorage.getItem('userId');
    if (storedId) {
      this.userId = +storedId;}

    if (!this.userId) return;

    this.userService.getUserInfo(this.userId).subscribe({
      next: (data) => {
        this.hasInfo = true;
        const [name, lastName] = data.fullName.split(' ');
        this.profileForm.patchValue({
          name,
          lastName,
          phonePrefix: data.phone?.substring(0, 3) || '+57',
          phone: data.phone?.substring(3),
          country: data.country,
          birthDate: data.birthDate?.split('T')[0] || '',
        });
        this.profileForm.disable();
      },
      error: () => {
        this.hasInfo = false;
        this.profileForm.disable(); // Deshabilitar hasta que presione editar
      }
    });
  }

  enableEdit() {
    this.isEditMode = true;
    this.profileForm.enable();
  }

  onSubmit() {
    if (this.profileForm.invalid) return;

    const storedId = localStorage.getItem('userId');
    if (storedId) {
      this.userId = +storedId;}
    const formData = this.profileForm.value;

    this.userService.updateUser(this.userId, formData).subscribe({
      next: (res) => {
        alert('Datos actualizados correctamente');
        this.isEditMode = false;
        this.profileForm.disable();
      },
      error: () => alert('Error al actualizar los datos')
    });
  }
}
