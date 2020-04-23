import {Component, EventEmitter, OnInit, Output, Input} from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent implements OnInit {

  @Input() type = 'button';
  @Input() disabled = false;
  @Input() submit = false;
  @Input() primary = false;
  @Input() secondary = false;
  @Input() link_button = false;
  @Input() outlined = false;
  @Input() link_button_white = false;
  @Input() link_button_black = false;
  @Input() link_button_purple = false;
  @Output() clicked: EventEmitter<any> = new EventEmitter();

  onClick(e: Event) {
    if (!this.disabled) {
      this.clicked.emit();
    } else {
      e.preventDefault();
      e.stopImmediatePropagation();
      e.stopPropagation();
      return false;
    }
  }

  ngOnInit() {
  }

}
