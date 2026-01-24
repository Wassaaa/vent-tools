import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TranslocoTitleStrategy extends TitleStrategy {
  private readonly transloco = inject(TranslocoService);
  private readonly title = inject(Title);
  private langChangeSub: Subscription | null = null;

  constructor() {
    super();
    // Re-update title when language changes
    this.langChangeSub = this.transloco.langChanges$.subscribe(() => {
      // We can't easily re-run updateTitle without a snapshot, 
      // but usually the router re-emits events or we can rely on page navigation.
      // For now, simple navigation triggers title update.
    });
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const titleKey = this.buildTitle(snapshot);
    if (titleKey) {
      this.transloco.selectTranslate(titleKey).subscribe((translatedTitle) => {
        this.title.setTitle(`${translatedTitle} | VentTools`);
      });
    } else {
      this.title.setTitle('VentTools');
    }
  }
}
