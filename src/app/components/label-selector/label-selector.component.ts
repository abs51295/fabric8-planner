import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { cloneDeep } from 'lodash';
import { LabelModel } from './../../models/label.model';
import { LabelService } from './../../services/label.service';


@Component({
  selector: 'label-selector',
  templateUrl: './label-selector.component.html',
  styleUrls: ['./label-selector.component.less']
})

export class LabelSelectorComponent implements OnInit, OnChanges {

  @ViewChild('labelname') labelnameInput: ElementRef;
  @Input() allLabels: LabelModel[] = [];
  @Input() selectedLabels: LabelModel[] = [];

  private activeAddLabel: boolean = false;
  private backup: any[] = [];
  private colorPickerActive: boolean = false;
  private colors: any[] = [];
  private createDisabled: boolean = false;
  private labels: any[] = [];
  private multiSelect: boolean = true;
  private newSelectedColor: any = {};
  private searchValue: string = '';

  constructor(
    private labelService: LabelService
  ) {}

  ngOnInit() {
    this.colors = [
      {color: '#fbdebf', border: '#f39d3c'},
      {color: '#f7bd7f', border: '#f39d3c'},
      {color: '#fbeabc', border: '#f39d3c'},
      {color: '#f9d67a', border: '#f39d3c'},
      {color: '#e4f5bc', border: '#ace12e'},
      {color: '#cfe7cd', border: '#6ec664'},
      {color: '#9ecf99', border: '#6ec664'},
      {color: '#bedee1', border: '#3a9ca6'},
      {color: '#7dbdc3', border: '#3a9ca6'},
      {color: '#beedf9', border: '#35caed'},
      {color: '#7cdbf3', border: '#35caed'},
      {color: '#c7bfff', border: '#8461f7'},
      {color: '#a18fff', border: '#8461f7'},
      {color: '#ededed', border: '#bbbbbb'},
      {color: '#d1d1d1', border: '#bbbbbb'}
    ];
    this.newSelectedColor = this.colors[0];
  }

  ngOnChanges(changes: SimpleChanges) {
    if( changes.allLabels ) {
      this.backup = cloneDeep(this.allLabels.map((label: LabelModel) => {
        return {
          id: label.id,
          color: label.attributes['background-color'],
          border: label.attributes['border-color'],
          name: label.attributes.name,
          selected: false
        }
      }));
      if (this.searchValue.length) {
        this.labels =
          cloneDeep(this.backup.filter(i => i.name.indexOf(this.searchValue) > - 1));
      }
      else {
        this.labels = cloneDeep(this.backup);
      }
    }
    if( changes.selectedLabels ) {
      this.labels.forEach((label, index) => {
        if (this.selectedLabels.find(l => label.id === l.id)) {
          this.labels[index].selected = true;
        }
      })
      this.backup.forEach((label, index) => {
        if (this.selectedLabels.find(l => label.id === l.id)) {
          this.backup[index].selected = true;
        }
      })
    }
  }


  onSelect(event: any) {
    let findIndex = this.labels.findIndex(i => i.id === event.id);
    if (findIndex > -1) {
      if (this.multiSelect) {
        this.labels[findIndex].selected = !this.labels[findIndex].selected;
      } else {
        this.labels.forEach(i => i.selected = false);
        this.labels[findIndex].selected = true;
      }
    }
    let findIndexBackup = this.backup.findIndex(i => i.id === event.id);
    if (findIndexBackup > -1) {
      if (this.multiSelect) {
        this.backup[findIndexBackup].selected = !this.backup[findIndexBackup].selected;
      } else {
        this.backup.forEach(i => i.selected = false);
        this.backup[findIndexBackup].selected = true;
      }
    }
  }

  onSearch(event: any) {
    let needle = event.trim();
    this.searchValue = needle;
    if (needle.length) {
      this.labels = cloneDeep(this.backup.filter(i => i.name.indexOf(needle) > - 1));
    } else {
      this.labels = cloneDeep(this.backup);
    }
  }

  clickOnAddLabel() {
    this.activeAddLabel = true;
  }

  closeAddLabel() {
    this.activeAddLabel = false;
  }

  toggleColorPicker() {
    this.colorPickerActive = !this.colorPickerActive;
  }

  selectColor(color: any) {
    this.newSelectedColor = color;
  }
  createLabel(name: any) {
    if (name.trim() === '' || this.createDisabled) {
      return;
    }
    this.createDisabled = true;
    let labelPayload: LabelModel  = {
      attributes: {
        'name': name,
        'background-color': this.newSelectedColor.color,
        'border-color': this.newSelectedColor.border
      }
    };
    this.labelService.createLabel(labelPayload)
      .subscribe((data: LabelModel) => {
        this.createDisabled = false;
        const newLabel = {
          id: data.id,
          color: data.attributes['background-color'],
          border: data.attributes['border-color'],
          name: data.attributes.name,
          selected: false
        };
        this.backup = [cloneDeep(newLabel), ...this.backup];
        if (this.searchValue === '' ||
            (this.searchValue !== '' &&
              name.indexOf(this.searchValue) > - 1
            )
          ) {
            this.labels = [cloneDeep(newLabel), ...this.labels];
          }
        this.labelnameInput.nativeElement.value = '';
        this.labelnameInput.nativeElement.focus();
      });
  }
}