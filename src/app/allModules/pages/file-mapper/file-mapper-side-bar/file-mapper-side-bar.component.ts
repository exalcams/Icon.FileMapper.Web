import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Guid } from 'guid-typescript';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { MatSnackBar } from '@angular/material';
import { FileMapper } from 'app/models/file-mapper';

@Component({
  selector: 'file-mapper-side-bar',
  templateUrl: './file-mapper-side-bar.component.html',
  styleUrls: ['./file-mapper-side-bar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})

export class FileMapperSideBarComponent implements OnInit, OnChanges {

  searchText: string;
  selectID: Guid;
  @Input() AllFileMappers: FileMapper[] = [];
  @Output() FileMapperSelectionChanged: EventEmitter<FileMapper> = new EventEmitter<FileMapper>();
  notificationSnackBarComponent: NotificationSnackBarComponent;
  constructor(public snackBar: MatSnackBar) {
    this.searchText = '';
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
  }
  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.AllFileMappers.length > 0) {
      this.selectID = this.AllFileMappers[0].MapperID;
      this.loadSelectedFileMapper(this.AllFileMappers[0]);
    }
  }

  loadSelectedFileMapper(SelectedFileMapper: FileMapper): void {
    this.selectID = SelectedFileMapper.MapperID;
    this.FileMapperSelectionChanged.emit(SelectedFileMapper);
  }

  clearFileMapper(): void {
    this.selectID = null;
    this.FileMapperSelectionChanged.emit(null);
  }

}
