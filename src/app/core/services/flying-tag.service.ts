import { DOCUMENT } from '@angular/common';
import {
  ApplicationRef,
  EnvironmentInjector,
  inject,
  Injectable,
} from '@angular/core';

export interface FlyingTagData {
  size: string;
  type: string;
  amount: number;
}

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
   * @param data The tag data to display
   */
  fly(sourceElement: HTMLElement, data: FlyingTagData) {
    if (!this.targetElement) {
      console.warn('FlyingTagService: No target set. Call setTarget() first.');
      return;
    }

    // 1. Get coordinates
    const startRect = sourceElement.getBoundingClientRect();
    const targetRect = this.targetElement.getBoundingClientRect();

    // 2. Create the flying element
    const flyer = this.document.createElement('div');
    flyer.classList.add('activity-tag'); // Use shared styles

    // Construct rich HTML content matching TotalBar
    flyer.innerHTML = `
      <span class="tag-size">${data.size}</span>
      <span class="tag-type">${data.type}</span>
      <span class="tag-amount">x${data.amount}</span>
    `;

    // Apply positioning styles (visual styles handled by CSS class)
    Object.assign(flyer.style, {
      position: 'fixed',
      zIndex: '9999',
      top: '0',
      left: '0',
      pointerEvents: 'none',
      boxShadow: '0 4px 10px rgba(0,0,0,0.2)', // Extra shadow for flight depth
      // Initial position at source
      transform: `translate(${startRect.left + startRect.width / 2}px, ${startRect.top}px) scale(0.5)`,
      opacity: '0',
      // Override transform origin to center for smooth scaling
      transformOrigin: 'center center',
    });

    this.document.body.appendChild(flyer);

    // 3. Define Keyframes (Start -> Mid -> End)
    // Calculate target position based on layout
    let targetX: number;
    const targetY = targetRect.top + targetRect.height / 2;

    const firstChild = this.targetElement.firstElementChild;

    if (firstChild) {
      // Target the left edge of the current first item
      const childRect = firstChild.getBoundingClientRect();
      targetX = childRect.left;
    } else {
      // Empty list: respect justify-content
      const styles = window.getComputedStyle(this.targetElement);
      const justify = styles.justifyContent;

      if (justify.includes('end') || justify.includes('right')) {
        targetX = targetRect.right - 40;
      } else if (justify.includes('center')) {
        targetX = targetRect.left + targetRect.width / 2;
      } else {
        targetX = targetRect.left + 40;
      }
    }

    // Randomize the "up" arc direction to create a fan effect
    // Spread of +/- 60px horizontally
    const spreadX = (Math.random() - 0.5) * 120;

    const keyframes = [
      // Start: At button
      {
        transform: `translate(${startRect.left + startRect.width / 2}px, ${startRect.top}px) scale(0.3)`,
        opacity: 0,
        offset: 0,
      },
      // Peak: Arc up with random spread
      {
        opacity: 1,
        // Add spreadX to initial X position
        transform: `translate(${
          startRect.left + startRect.width / 2 + spreadX
        }px, ${startRect.top - 60}px) scale(1.3)`,
        offset: 0.9,
      },
      // End: At calculated spawn point
      {
        transform: `translate(${targetX}px, ${targetY}px) scale(0.8)`,
        opacity: 0,
        offset: 1,
      },
    ];

    const timing: KeyframeAnimationOptions = {
      duration: 1100,
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
