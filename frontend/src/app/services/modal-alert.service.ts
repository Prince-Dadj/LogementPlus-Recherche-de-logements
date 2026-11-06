import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Reservation } from '../models/models';

export type ModalAlertType = 'success' | 'warning' | 'error' | 'info' | 'recu' | 'contrat';

export interface ModalAlertConfig {
  isOpen: boolean;
  title: string;
  message?: string;
  type: ModalAlertType;
  confirmText?: string;
  cancelText?: string;
  isConfirm?: boolean;
  reservation?: Reservation | null;
  customData?: any;
  resolve?: (value: boolean) => void;
}

@Injectable({
  providedIn: 'root'
})
export class ModalAlertService {
  private initialState: ModalAlertConfig = {
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: 'Compris',
    cancelText: 'Annuler',
    isConfirm: false,
    reservation: null
  };

  private stateSubject = new BehaviorSubject<ModalAlertConfig>(this.initialState);
  public state$ = this.stateSubject.asObservable();

  public show(options: {
    title?: string;
    message?: string;
    type?: ModalAlertType;
    confirmText?: string;
    cancelText?: string;
    isConfirm?: boolean;
    reservation?: Reservation | null;
    customData?: any;
  }): Promise<boolean> {
    return new Promise((resolve) => {
      this.stateSubject.next({
        isOpen: true,
        title: options.title || this.getDefaultTitle(options.type || 'info'),
        message: options.message || '',
        type: options.type || 'info',
        confirmText: options.confirmText || (options.isConfirm ? 'Confirmer' : 'Compris'),
        cancelText: options.cancelText || 'Annuler',
        isConfirm: !!options.isConfirm,
        reservation: options.reservation || null,
        customData: options.customData,
        resolve
      });
    });
  }

  public success(message: string, title = 'Opération réussie'): Promise<boolean> {
    return this.show({ title, message, type: 'success' });
  }

  public error(message: string, title = 'Erreur'): Promise<boolean> {
    return this.show({ title, message, type: 'error' });
  }

  public warning(message: string, title = 'Attention'): Promise<boolean> {
    return this.show({ title, message, type: 'warning' });
  }

  public info(message: string, title = 'Information'): Promise<boolean> {
    return this.show({ title, message, type: 'info' });
  }

  public confirm(message: string, title = 'Confirmation', confirmText = 'Oui, confirmer', cancelText = 'Annuler'): Promise<boolean> {
    return this.show({
      title,
      message,
      type: 'warning',
      isConfirm: true,
      confirmText,
      cancelText
    });
  }

  public showRecu(reservation: Reservation): Promise<boolean> {
    return this.show({
      title: 'Reçu Officiel de Paiement',
      type: 'recu',
      reservation,
      confirmText: 'Fermer'
    });
  }

  public showContrat(reservation: Reservation): Promise<boolean> {
    return this.show({
      title: 'Contrat de Bail Dématérialisé',
      type: 'contrat',
      reservation,
      confirmText: 'Fermer'
    });
  }

  public confirmAction(): void {
    const current = this.stateSubject.value;
    if (current.resolve) {
      current.resolve(true);
    }
    this.close();
  }

  public cancelAction(): void {
    const current = this.stateSubject.value;
    if (current.resolve) {
      current.resolve(false);
    }
    this.close();
  }

  public close(): void {
    this.stateSubject.next({ ...this.initialState });
  }

  private getDefaultTitle(type: ModalAlertType): string {
    switch (type) {
      case 'success': return 'Succès';
      case 'warning': return 'Attention';
      case 'error': return 'Erreur';
      case 'recu': return 'Reçu de Paiement Officiel';
      case 'contrat': return 'Contrat de Bail Dématérialisé';
      default: return 'Notification';
    }
  }
}
