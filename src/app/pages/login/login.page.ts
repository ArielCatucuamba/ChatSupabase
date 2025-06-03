import { SupabaseService } from './../../services/supabase.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController, IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class LoginPage implements OnInit {

  credentials!: FormGroup; // <-- Usa el operador ! para evitar el error de inicialización

  constructor(
    private fb: FormBuilder,
    private alertController: AlertController,
    private router: Router,
    private loadingController: LoadingController,
    private supabaseService: SupabaseService
  ) { }

  ngOnInit() {
    this.credentials = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      full_name: ['', Validators.required], // nuevo campo
      avatar: [null] // nuevo campo
    });
  }
  async login() {
    const loading = await this.loadingController.create();
    await loading.present();

    this.supabaseService.signIn(this.credentials.value).then(
      async (data: any) => {
        await loading.dismiss();
        this.router.navigateByUrl('/list', { replaceUrl: true });
      },
      async (err: any) => {
        await loading.dismiss();
        this.showError('Intento dallido ', err.message);
      }
    );
  }

  async signUp() {
    const loading = await this.loadingController.create();
    await loading.present();

    try {
      const { email, password, full_name } = this.credentials.value;
      // 1. Registrar usuario
      const { data, error } = await this.supabaseService.signUpWithProfile(email, password, full_name);
      if (error) throw error;

      // 2. Subir avatar si hay archivo seleccionado
      let avatar_url = '';
      if (this.selectedAvatarFile && data.user) {
        avatar_url = await this.supabaseService.uploadAvatar(data.user.id, this.selectedAvatarFile);
      }

      // 3. Actualizar perfil con avatar_url
      if (avatar_url) {
        await this.supabaseService.updateProfile({ avatar_url });
      }

      await loading.dismiss();
      this.showError('Registro exitoso', 'Confirma tu email (revisa tu correo)!');
    } catch (err: any) {
      await loading.dismiss();
      const alert = await this.alertController.create({
        header: 'Registro fallido',
        message: err.error?.msg || err.message,
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

  selectedAvatarFile: File | null = null;

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedAvatarFile = file;
      this.credentials.patchValue({ avatar: file });
    }
  }

  async showError(title: string, msg: string) { // <-- Especifica los tipos de los parámetros
    const alert = await this.alertController.create({
      header: title,
      message: msg,
      buttons: ['OK'],
    });
    await alert.present();
  }
}