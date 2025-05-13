import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

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
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class CompleteProfileComponent {
  fb = inject(FormBuilder);
  profileForm = this.fb.group({
    name: ['', Validators.required],
    lastName: ['', Validators.required],
    phonePrefix: ['+57'],
    phone: ['', Validators.required],
    country: [''],
    birthDate: ['']
  });

  onSubmit() {
    if (this.profileForm.valid) {
      console.log(this.profileForm.value); // Aquí harías el PUT al endpoint update
    }
  }
}
