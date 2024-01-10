import { Directive, ElementRef, AfterViewInit } from "@angular/core";

@Directive({
  selector: "[trapFocus]",
  standalone: true,
  
})
export class TrapFocusDirective implements AfterViewInit {
  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    this.trapFocus(this.el.nativeElement);
  }

  trapFocus(element: any) {
    const focusableEls1 = element.querySelectorAll(
      'a[href], button, textarea, input[type="text"],' + 'input[type="radio"], input[type="checkbox"], select'
    );
    const focusableEls = Array.from(focusableEls1).filter((el: any) => !el.disabled);
    const firstFocusableEl: any = focusableEls[0];
    const lastFocusableEl: any = focusableEls[focusableEls.length - 1];

    element.addEventListener("keydown", function (e: any) {
      var isTabPressed = e.keyCode === 9; // isTabPressed
      if (!isTabPressed) return;

      if (e.shiftKey) {
        // /* shift + tab */ if (document.activeElement === firstFocusableEl) {
          lastFocusableEl.focus();
          e.preventDefault();
        // }
      } /* tab */ else {
        if (document.activeElement === lastFocusableEl) {
          firstFocusableEl.focus();
          e.preventDefault();
        }
      }
    });
  }
}
