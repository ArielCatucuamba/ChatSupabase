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
  ) {}

  ngOnInit() {
    this.credentials = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
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

    this.supabaseService.signUp(this.credentials.value).then(
      async (data: any) => {
        await loading.dismiss();
        this.showError('Registro exitoso', 'Confirma tu email (revisa tu correo)!');
      },
      async (err: any) => {
        await loading.dismiss();
        const alert = await this.alertController.create({
          header: 'Registro fallido',
          message: err.error?.msg || err.message,
          buttons: ['OK'],
        });
        await alert.present();
      }
    );
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