import { Component, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { FileMapper } from 'app/models/file-mapper';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { FileMapperService } from 'app/services/file-mapper.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { Guid } from 'guid-typescript';

@Component({
  selector: 'app-bot-schedule',
  templateUrl: './bot-schedule.component.html',
  styleUrls: ['./bot-schedule.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class BotScheduleComponent implements OnInit {

  searchText: string;
  AllFileMappers: FileMapper[] = [];
  IsProgressBarVisibile: boolean;
  fileMapperMainFormGroup: FormGroup;
 // fileMapper: FileMapper;
  currentSelectedFileMapper: FileMapper;
  AllModes: string[] = ['Email', 'Folder', 'API'];
  AllConnectivities: string[] = ['IMAP', 'POP3', 'Exchange'];
  AttachmentTypeList: string[] = ['Pdf', 'Jpg', 'Png'];
  StatusList: string[] = ['Created', 'TestRun', 'Processed'];
  // StatusList: [{ name: 'Created' }, { name: 'TestRun' }, { name: 'Processed' }];
  notificationSnackBarComponent: NotificationSnackBarComponent;
  // SelectedFileMapper: FileMapper;
  GetAllPatterns: string[] = [];
  SelectedMapperID: Guid;
  constructor(private _fileMapperService: FileMapperService, private _router: Router,
    private _formBuilder: FormBuilder,
    public snackBar: MatSnackBar) {
    this.currentSelectedFileMapper = new FileMapper();
    this.searchText = '';
    this.fileMapperMainFormGroup = this._formBuilder.group({
      MapperID: [''],
      Mode: [''],
      Connectivity: [''],
      Subject: [''],
      From: [''],
      AttachmentType: [''],
      TrainingContext: [''],
      Host: [''],
      Port: [''],
      Email: [''],
      Password: ['']
    });
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);

  }

  ngOnInit() {
    this.GetAllFileMappers();
  }

  GetAllFileMappers(): void {
    this._fileMapperService.GetAllFileMappers().subscribe(
      (data) => {
        this.AllFileMappers = <FileMapper[]>data;
        this.IsProgressBarVisibile = false;
        this.SelectedMapperID = this.AllFileMappers[0].MapperID;
        this.fileMapperClick(this.AllFileMappers[0]);
        // console.log(this.AllFileMappers);
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }
  GetAllPattern(): void {
    this._fileMapperService.GetAllPatterns().subscribe(
      (data) => {
        this.GetAllPatterns = <string[]>data;
        this.IsProgressBarVisibile = false;
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }
  fileMapperClick(selectedMapper: FileMapper): void {
    // console.log(selectedMapper);
    this.SelectedMapperID = selectedMapper.MapperID;
    this.currentSelectedFileMapper = selectedMapper;
    //console.log(this.currentSelectedFileMapper);
   this.fileMapperMainFormGroup.get('MapperID').patchValue(selectedMapper.MapperID);
   this.fileMapperMainFormGroup.get('Mode').patchValue(selectedMapper.Mode);
   this.fileMapperMainFormGroup.get('Connectivity').patchValue(selectedMapper.ConnectionServer);
   this.fileMapperMainFormGroup.get('TrainingContext').patchValue(selectedMapper.PatternID);
   this.fileMapperMainFormGroup.get('Subject').patchValue(selectedMapper.Subject);
   this.fileMapperMainFormGroup.get('From').patchValue(selectedMapper.FromMail);
   this.fileMapperMainFormGroup.get('Host').patchValue(selectedMapper.Host);
   this.fileMapperMainFormGroup.get('Port').patchValue(selectedMapper.Port);
   this.fileMapperMainFormGroup.get('Email').patchValue(selectedMapper.Email);
   this.fileMapperMainFormGroup.get('Password').patchValue(selectedMapper.Password);
   this.fileMapperMainFormGroup.get('AttachmentType').patchValue(selectedMapper.AttachmentType);
  }

  // ResetControl(): void {
  //   this.fileMapper = new FileMapper();
  //   this.fileMapperMainFormGroup.reset();
  //   Object.keys(this.fileMapperMainFormGroup.controls).forEach(key => {
  //     // const control = this.fileMapperMainFormGroup.get(key);
  //     this.fileMapperMainFormGroup.get(key).markAsUntouched();
  //   });
  // }
}
