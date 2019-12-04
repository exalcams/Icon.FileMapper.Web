import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn, ValidationErrors, FormControl } from '@angular/forms';
import { Guid } from 'guid-typescript';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { MatSnackBar, MatDialogConfig, MatDialog, MatChipInputEvent } from '@angular/material';
import { FileUploader, FileItem } from 'ng2-file-upload';
import { AuthService } from 'app/services/auth.service';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { Router } from '@angular/router';
import { AuthenticationDetails } from 'app/models/master';
import { FileMapper, PatternMatching } from 'app/models/file-mapper';
import { FileMapperService } from 'app/services/file-mapper.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

@Component({
  selector: 'file-mapper-main-content',
  templateUrl: './file-mapper-main-content.component.html',
  styleUrls: ['./file-mapper-main-content.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})

export class FileMapperMainContentComponent implements OnInit, OnChanges {

  @Input() currentSelectedFileMapper: FileMapper = new FileMapper();
  @Output() SaveSucceed: EventEmitter<string> = new EventEmitter<string>();
  @Output() ShowProgressBarEvent: EventEmitter<string> = new EventEmitter<string>();
  fileMapper: FileMapper;
  fileMapperMainFormGroup: FormGroup;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  fileToUpload: File;
  fileUploader: FileUploader;
  baseAddress: string;
  AllModes: string[] = ['Email', 'Folder', 'API'];
  AllConnectivities: string[] = ['IMAP', 'POP3', 'Exchange'];
  IsConnectivity: boolean;
  slectedProfile: Uint8Array;
  authenticationDetails: AuthenticationDetails;
  GetAllPatterns: string[] = [];
  AttachmentTypes = new FormControl();
  AttachmentTypeList = [{ name: 'PDF' }, { name: 'JPG' }, { name: 'PNG' }];
  // [{ name: 'PDF' }, { name: 'JPG' }, { name: 'PNG' }];

  IsProgressBarVisibile: boolean;

  constructor(private _fileMapperService: FileMapperService,
    private _router: Router,
    private _formBuilder: FormBuilder,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private _authService: AuthService) {
    this.fileMapperMainFormGroup = this._formBuilder.group({
      Mode: ['', Validators.required],
      // MailBox: ['', Validators.required],
      Connectivity: ['', Validators.required],
      Subject: [''],
      From: ['', [Validators.required]],
      AttachmentType: ['', Validators.required],
      TrainingContext: ['', Validators.required],
      // IntervalCheck: ['', Validators.required],
      Host: ['', Validators.required],
      Port: ['', Validators.required],
      Email: ['', [Validators.required, Validators.email]],
      Password: ['', Validators.required]
    });
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.fileMapper = new FileMapper();
    this.authenticationDetails = new AuthenticationDetails();
    this.baseAddress = _authService.baseAddress;
    this.IsConnectivity = false;

    // function ValidateUrl(control: AbstractControl) {
    //   if (!control.value.startsWith() || !control.value.includes('@byjus.com')) {
    //     return { validUrl: true };
    //   }
    //   return null;
    // }
  }

  ngOnInit(): void {
    this.GetAllPattern();
    this.GetAllPattern();
    // Retrive authorizationData
    const retrievedObject = localStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
    } else {
      this._router.navigate(['/auth/login']);
    }
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
  ResetControl(): void {
    this.fileMapper = new FileMapper();
    this.fileMapperMainFormGroup.reset();
    Object.keys(this.fileMapperMainFormGroup.controls).forEach(key => {
      // const control = this.fileMapperMainFormGroup.get(key);
      this.fileMapperMainFormGroup.get(key).markAsUntouched();
    });
    this.fileToUpload = null;
  }


  SaveClicked(): void {
    if (this.fileMapperMainFormGroup.valid) {
      const file: File = this.fileToUpload;
      if (this.fileMapper.MapperID) {
        const dialogConfig: MatDialogConfig = {
          data: {
            Actiontype: 'Update',
            Catagory: 'File Mapper'
          },
          panelClass: 'confirmation-dialog'
        };
        const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(
          result => {
            if (result) {
              this.ShowProgressBarEvent.emit('show');
              this.fileMapper.Mode = this.fileMapperMainFormGroup.get('Mode').value;
              // this.fileMapper.MapperID = <Guid>this.fileMapperMainFormGroup.get('MapperID').value;
              // this.fileMapper.MailBox = this.fileMapperMainFormGroup.get('MailBox').value;
              this.fileMapper.ConnectionServer = this.fileMapperMainFormGroup.get('Connectivity').value;
              this.fileMapper.Subject = this.fileMapperMainFormGroup.get('Subject').value;
              this.fileMapper.FromMail = this.fileMapperMainFormGroup.get('From').value;
              this.fileMapper.PatternID = this.fileMapperMainFormGroup.get('TrainingContext').value;
              // this.fileMapper.IntervalCheck = this.fileMapperMainFormGroup.get('IntervalCheck').value;
              this.fileMapper.Host = this.fileMapperMainFormGroup.get('Host').value;
              this.fileMapper.Port = this.fileMapperMainFormGroup.get('Port').value;
              this.fileMapper.Email = this.fileMapperMainFormGroup.get('Email').value;
              this.fileMapper.Password = this.fileMapperMainFormGroup.get('Password').value;
              this.fileMapper.AttachmentType = this.fileMapperMainFormGroup.get('AttachmentType').value.toString();
              this.fileMapper.CreatedBy = this.authenticationDetails.userID.toString();
              console.log(this.fileMapper.AttachmentType);
              this._fileMapperService.UpdateFileMapper(this.fileMapper).subscribe(
                (data) => {
                  // console.log(data);
                  this.ResetControl();
                  this.notificationSnackBarComponent.openSnackBar('File Mapper updated successfully', SnackBarStatus.success);
                  this.SaveSucceed.emit('success');
                  this._fileMapperService.TriggerNotification('File Mapper updated successfully');
                },
                (err) => {
                  console.error(err);
                  this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
                  this.ShowProgressBarEvent.emit('hide');
                }
              );
            }
          }
        );

      } else {
        const dialogConfig: MatDialogConfig = {
          data: {
            Actiontype: 'Create',
            Catagory: 'FileMapper'
          },
          panelClass: 'confirmation-dialog'
        };
        const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(
          result => {
            if (result) {
              this.ShowProgressBarEvent.emit('show');
              this.fileMapper = new FileMapper();
              this.fileMapper.Mode = this.fileMapperMainFormGroup.get('Mode').value;
              // this.fileMapper.MailBox = this.fileMapperMainFormGroup.get('MailBox').value;
              this.fileMapper.ConnectionServer = this.fileMapperMainFormGroup.get('Connectivity').value;
              this.fileMapper.Subject = this.fileMapperMainFormGroup.get('Subject').value;
              this.fileMapper.FromMail = this.fileMapperMainFormGroup.get('From').value;
              this.fileMapper.PatternID = this.fileMapperMainFormGroup.get('TrainingContext').value;
              // this.fileMapper.IntervalCheck = this.fileMapperMainFormGroup.get('IntervalCheck').value;
              this.fileMapper.Host = this.fileMapperMainFormGroup.get('Host').value;
              this.fileMapper.Port = this.fileMapperMainFormGroup.get('Port').value;
              this.fileMapper.Email = this.fileMapperMainFormGroup.get('Email').value;
              this.fileMapper.Password = this.fileMapperMainFormGroup.get('Password').value;
              this.fileMapper.AttachmentType = this.fileMapperMainFormGroup.get('AttachmentType').value.toString();
              this.fileMapper.CreatedBy = this.authenticationDetails.userID.toString();
              this._fileMapperService.CreateFileMapper(this.fileMapper).subscribe(
                (data) => {
                  // console.log(data);
                  this.ResetControl();
                  this.notificationSnackBarComponent.openSnackBar('File Mapper created successfully', SnackBarStatus.success);
                  this.SaveSucceed.emit('success');
                  this._fileMapperService.TriggerNotification('File Mapper created successfully');
                },
                (err) => {
                  console.error(err);
                  this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
                  this.ShowProgressBarEvent.emit('hide');
                }
              );
            }
          });
      }
    } else {
      Object.keys(this.fileMapperMainFormGroup.controls).forEach(key => {
        this.fileMapperMainFormGroup.get(key).markAsTouched();
        this.fileMapperMainFormGroup.get(key).markAsDirty();
      });
    }
  }

  DeleteClicked(): void {
    if (this.fileMapperMainFormGroup.valid) {
      if (this.fileMapper.MapperID) {
        const dialogConfig: MatDialogConfig = {
          data: {
            Actiontype: 'Delete',
            Catagory: 'FileMapper'
          },
          panelClass: 'confirmation-dialog'
        };
        const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(
          result => {
            if (result) {
              this.ShowProgressBarEvent.emit('show');
              this.fileMapper.Mode = this.fileMapperMainFormGroup.get('Mode').value;
              // this.fileMapper.MailBox = this.fileMapperMainFormGroup.get('MailBox').value;
              this.fileMapper.ConnectionServer = this.fileMapperMainFormGroup.get('Connectivity').value;
              this.fileMapper.Subject = this.fileMapperMainFormGroup.get('Subject').value;
              this.fileMapper.FromMail = this.fileMapperMainFormGroup.get('From').value;
              this.fileMapper.TrainingContext = this.fileMapperMainFormGroup.get('TrainingContext').value;
              // this.fileMapper.IntervalCheck = this.fileMapperMainFormGroup.get('IntervalCheck').value;
              this.fileMapper.Host = this.fileMapperMainFormGroup.get('Host').value;
              this.fileMapper.Port = this.fileMapperMainFormGroup.get('Port').value;
              this.fileMapper.Email = this.fileMapperMainFormGroup.get('Email').value;
              this.fileMapper.Password = this.fileMapperMainFormGroup.get('Password').value;
              this.fileMapper.AttachmentType = this.fileMapperMainFormGroup.get('AttachmentType').value;
              this.fileMapper.ModifiedBy = this.authenticationDetails.userID.toString();
              this._fileMapperService.DeleteFileMapper(this.fileMapper).subscribe(
                (data) => {
                  // console.log(data);
                  this.ResetControl();
                  this.notificationSnackBarComponent.openSnackBar('File Mapper deleted successfully', SnackBarStatus.success);
                  this.SaveSucceed.emit('success');
                  this._fileMapperService.TriggerNotification('File Mapper deleted successfully');
                },
                (err) => {
                  console.error(err);
                  this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
                  this.ShowProgressBarEvent.emit('hide');
                }
              );
            }
          });
      }
    } else {
      Object.keys(this.fileMapperMainFormGroup.controls).forEach(key => {
        this.fileMapperMainFormGroup.get(key).markAsTouched();
        this.fileMapperMainFormGroup.get(key).markAsDirty();
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.currentSelectedFileMapper) {
      // console.log(this.currentSelectedFileMapper);
      this.fileMapper = new FileMapper();
      this.fileMapper.MapperID = this.currentSelectedFileMapper.MapperID;
      this.fileMapper.Mode = this.currentSelectedFileMapper.Mode;
      // this.fileMapper.MailBox = this.currentSelectedFileMapper.MailBox;
      this.fileMapper.Email = this.currentSelectedFileMapper.Email;
      this.fileMapper.Password = this.currentSelectedFileMapper.Password;
      this.fileMapper.ConnectionServer = this.currentSelectedFileMapper.ConnectionServer;
      this.fileMapper.Subject = this.currentSelectedFileMapper.Subject;
      this.fileMapper.FromMail = this.currentSelectedFileMapper.FromMail;
      this.fileMapper.AttachmentType = this.currentSelectedFileMapper.AttachmentType;
      this.fileMapper.PatternID = this.currentSelectedFileMapper.PatternID;
      // this.fileMapper.IntervalCheck = this.currentSelectedFileMapper.IntervalCheck;
      this.fileMapper.Host = this.currentSelectedFileMapper.Host;
      this.fileMapper.Port = this.currentSelectedFileMapper.Port;
      // this.fileMapper.CreatedBy = this.currentSelectedFileMapper.CreatedBy;
      // this.fileMapper.CreatedOn = this.currentSelectedFileMapper.CreatedOn;
      // this.fileMapper.ModifiedBy = this.currentSelectedFileMapper.ModifiedBy;
      // this.fileMapper.ModifiedOn = this.currentSelectedFileMapper.ModifiedOn;
      this.fileMapperMainFormGroup.get('Mode').patchValue(this.fileMapper.Mode);
      this.fileMapperMainFormGroup.get('Connectivity').patchValue(this.fileMapper.ConnectionServer);
      this.fileMapperMainFormGroup.get('Subject').patchValue(this.fileMapper.Subject);
      this.fileMapperMainFormGroup.get('From').patchValue(this.fileMapper.FromMail);
      this.fileMapperMainFormGroup.get('TrainingContext').patchValue(this.fileMapper.PatternID);
      // this.fileMapperMainFormGroup.get('MailBox').patchValue(this.fileMapper.MailBox);
      // this.fileMapperMainFormGroup.get('IntervalCheck').patchValue(this.fileMapper.IntervalCheck);
      this.fileMapperMainFormGroup.get('Host').patchValue(this.fileMapper.Host);
      this.fileMapperMainFormGroup.get('Port').patchValue(this.fileMapper.Port);
      this.fileMapperMainFormGroup.get('Email').patchValue(this.fileMapper.Email);
      this.fileMapperMainFormGroup.get('Password').patchValue(this.fileMapper.Password);
      // this.fileMapperMainFormGroup.get('AttachmentType').patchValue(this.fileMapper.AttachmentType);
      // this.AttachmentTypeList = this.fileMapperMainFormGroup.get('AttachmentType').value;
      //  console.log(this.fileMapperMainFormGroup);
    } else {
      this.ResetControl();
    }
  }

  onConnectivityClick(selectedConnectivity: string): void {
    // console.log(selectedConnectivity);
    if (selectedConnectivity) {
      if (selectedConnectivity) {
        this.IsConnectivity = true;
      } else {
        this.IsConnectivity = false;
      }
    }
  }

  handleFileInput(evt): void {
    if (evt.target.files && evt.target.files.length > 0) {
      this.fileToUpload = evt.target.files[0];
    }
  }
}
