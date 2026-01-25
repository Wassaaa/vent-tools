import { DOCUMENT } from '@angular/common';
import {
  ApplicationRef,
  EnvironmentInjector,
  inject,
  Injectable,
} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FlyingTagService {
  private document = inject(DOCUMENT);
  private appRef = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);

  /**
   * Target element where tags should fly TO.
   * Usually the "Recent Activity" container in TotalBar.
   */
  private targetElement: HTMLElement | null = null;

  /**
   * Registers the target element (destination) for the flying animation.
   */
  setTarget(element: HTMLElement) {
    this.targetElement = element;
  }

  /**
   * Launches a flying animation from a source element to the registered target.
   * @param sourceElement The element to start the flight from (e.g. the Add button)
   * @param label Optional text to display inside the flying tag (e.g. "Ø120")
   */
  fly(sourceElement: HTMLElement, label: string = '') {
    if (!this.targetElement) {
      console.warn('FlyingTagService: No target set. Call setTarget() first.');
      return;
    }

    // 1. Get coordinates
    const startRect = sourceElement.getBoundingClientRect();
    const targetRect = this.targetElement.getBoundingClientRect();

    // 2. Create the flying element
    const flyer = this.document.createElement('div');
    flyer.classList.add('flying-tag-anim'); // We'll define this class in styles.scss
    flyer.textContent = label;

    // Apply basic styles for the flyer to look like a tag
    Object.assign(flyer.style, {
      position: 'fixed',
      zIndex: '9999',
      top: '0',
      left: '0',
      pointerEvents: 'none', // Allow clicks to pass through
      padding: '4px 8px',
      background: 'var(--mat-sys-primary)', // Use theme primary color
      color: 'var(--mat-sys-on-primary)',
      borderRadius: '8px',
      fontWeight: '500',
      fontSize: '14px',
      boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
      // Initial position at source
      transform: `translate(${startRect.left + startRect.width / 2}px, ${startRect.top}px) scale(0.5)`,
      opacity: '0',
    });

    this.document.body.appendChild(flyer);

    // 3. Define Keyframes (Start -> Mid -> End)
    // Calculate target position based on layout
    let targetX: number;
    const targetY = targetRect.top + targetRect.height / 2;

    const firstChild = this.targetElement.firstElementChild;

    if (firstChild) {
      // If list has items, new item spawns to the LEFT of the first item
      // So target the left edge of the current first item
      const childRect = firstChild.getBoundingClientRect();
      targetX = childRect.left;
    } else {
      // Empty list: respect justify-content
      const styles = window.getComputedStyle(this.targetElement);
      const justify = styles.justifyContent;

      if (justify.includes('end') || justify.includes('right')) {
        targetX = targetRect.right - 40; // Approximate padding
      } else if (justify.includes('center')) {
        targetX = targetRect.left + targetRect.width / 2;
      } else {
        // Default / fast-start
        targetX = targetRect.left + 40;
      }
    }

    const keyframes = [
      // Start: At button
      {
        transform: `translate(${startRect.left + startRect.width / 2}px, ${startRect.top}px) scale(0.5)`,
        opacity: 0,
        offset: 0,
      },
      // 20%: Pop in
      {
        opacity: 1,
        // Arc up
        transform: `translate(${startRect.left + startRect.width / 2}px, ${startRect.top - 40}px) scale(1.1)`,
        offset: 0.9,
      },
      // End: At calculated spawn point
      {
        transform: `translate(${targetX}px, ${targetY}px) scale(0.5)`,
        opacity: 0,
        offset: 1,
      },
    ];

    const timing: KeyframeAnimationOptions = {
      duration: 1000,
      easing: 'cubic-bezier(0.2, 1, 0.2, 1)', // Fast out, slow in
      fill: 'forwards',
    };

    // 4. Animate
    const animation = flyer.animate(keyframes, timing);

    // 5. Cleanup
    animation.onfinish = () => {
      flyer.remove();
    };
  }
}
