import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  // Estado para controlar la visibilidad del componente de carga
  public isLoading$ = new BehaviorSubject<boolean>(false);
  // Mensaje dinámico que se mostrará en la interfaz
  public loadingMessage$ = new BehaviorSubject<string>('Cargando datos...');

  show(message: string = 'Por favor, espera...') {
    this.loadingMessage$.next(message);
    this.isLoading$.next(true);
  }

  hide() {
    this.isLoading$.next(false);
  }

  updateMessage(message: string) {
    this.loadingMessage$.next(message);
  }
}
