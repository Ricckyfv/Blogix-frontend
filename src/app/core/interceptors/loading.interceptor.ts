import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const loadingService = inject(LoadingService);

  loadingService.show('Conectando con el servidor...');

  const timeoutId = setTimeout(() => {
    loadingService.updateMessage(
      'El servidor gratuito está despertando. Esto puede tardar entre 2 y 3 minutos debido a la inactividad inicial. Gracias por tu paciencia.'
    );
  }, 4000);

  return next(req).pipe(
    finalize(() => {
      clearTimeout(timeoutId);
      loadingService.hide();
    })
  );
};
