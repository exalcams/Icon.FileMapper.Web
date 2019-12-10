import { Component, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { FileMapper, BotScheduler, FileMaperWithSchedule } from 'app/models/file-mapper';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { FileMapperService } from 'app/services/file-mapper.service';
import { Router } from '@angular/router';
import { MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { Guid } from 'guid-typescript';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { AuthenticationDetails } from 'app/models/master';

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
  AllBotSchedule: BotScheduler[] = [];
  fileMaperWithSchedule: FileMaperWithSchedule;
  IsProgressBarVisibile: boolean;
  fileMapperMainFormGroup: FormGroup;
  fileMapperScheduleFormGroup: FormGroup;
  SelectPostCheckType: string;
  botSchedule: BotScheduler;
  // fileMapper: FileMapper;
  currentSelectedFileMapper: FileMapper;
  AllModes: string[] = ['Email', 'Folder', 'API'];
  AllConnectivities: string[] = ['IMAP', 'POP3', 'Exchange'];
  AttachmentTypeList: string[] = ['Pdf', 'Jpg', 'Png'];
  StatusList: string[] = ['Created', 'TestRun', 'Processed'];
  HoursList = [{ id: '01' }, { id: '02' }, { id: '03' }, { id: '04' }, { id: '05' }, { id: '06' }, { id: '07' }, { id: '08' }, { id: '09' }];
  minutesList = [{ id: '01' }, { id: '02' }, { id: '03' }, { id: '04' }, { id: '05' }, { id: '06' }, { id: '07' }, { id: '08' }, { id: '09' }];

  // hours: 12;
  // StatusList: [{ name: 'Created' }, { name: 'TestRun' }, { name: 'Processed' }];
  notificationSnackBarComponent: NotificationSnackBarComponent;
  // SelectedFileMapper: FileMapper;
  GetAllPatterns: string[] = [];
  SelectedMapperID: Guid;
  authenticationDetails: AuthenticationDetails;
  constructor(private _fileMapperService: FileMapperService, private _router: Router,
    private _formBuilder: FormBuilder,
    private dialog: MatDialog,
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
    this.fileMapperScheduleFormGroup = this._formBuilder.group({
      SchedulerID: [''],
      MapperID: [''],
      PostCheckType: ['', Validators.required],
      DateCheck: [''],
      DayCheck: [''],
      TimeCheck: [''],
      Interval: ['', [Validators.pattern]],
      hour: [''],
      minutes: [''],
      AMPM: ['']
    });
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);



  }

  ngOnInit() {
    this.GetAllFileMappers();
    // for (let i = 0; i < 12; i++) {
    //   this.HoursList.push(this.HoursList[i]);
    //   console.log(i);
    // }
    for (let i = 10; i <= 24; i++) {
      let newName = {
        id: i.toString(),
        //  name:"Tony"
      };
      this.HoursList.push(newName);
      // console.log(this.HoursList);
    }
    for (let i = 10; i < 60; i++) {
      let newName = {
        id: i.toString(),
        //  name:"Tony"
      };
      this.minutesList.push(newName);
      //  console.log(this.HoursList);
    }
  }

  GetAllFileMappers(): void {
    this._fileMapperService.GetAllFileMapperWithSchedule().subscribe(
      (data) => {
        this.fileMaperWithSchedule = <FileMaperWithSchedule>data;
        this.AllFileMappers = this.fileMaperWithSchedule.fileMappers;
        this.AllBotSchedule = this.fileMaperWithSchedule.botSchedulers;
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
   // console.log(botSchedule);
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

    this.AllBotSchedule.forEach(element => {
      if (element.MapperID === selectedMapper.MapperID) {
        this.SelectPostCheckType = element.PostCheckType;
        this.fileMapperScheduleFormGroup.get('PostCheckType').patchValue(element.PostCheckType);
        this.fileMapperScheduleFormGroup.get('DateCheck').patchValue(element.DateCheck);
        this.fileMapperScheduleFormGroup.get('DayCheck').patchValue(element.DayCheck);
        this.fileMapperScheduleFormGroup.get('Interval').patchValue(element.Interval);
        // this.fileMapperScheduleFormGroup.get('TimeCheck').patchValue(botSchedule.TimeCheck);
        if(element.TimeCheck !== null){
          let datetime = element.TimeCheck.split("T");
          let time = datetime[1];
          // console.log(datetime);
          // console.log(time);
          let hourminut = time.split(":");
          let hour = hourminut[0];
          let minut = hourminut[1];
          this.fileMapperScheduleFormGroup.get('hour').patchValue(hour);
          this.fileMapperScheduleFormGroup.get('minutes').patchValue(minut);
        }
      }
      if (element.MapperID === null){
        this.ResetControl();
      }
    });
    // if (selectedMapper.MapperID === botSchedule.MapperID) {
    //   this.SelectPostCheckType = botSchedule.PostCheckType;
    //   this.fileMapperScheduleFormGroup.get('PostCheckType').patchValue(botSchedule.PostCheckType);
    //   this.fileMapperScheduleFormGroup.get('DateCheck').patchValue(botSchedule.DateCheck);
    //   this.fileMapperScheduleFormGroup.get('DayCheck').patchValue(botSchedule.DayCheck);
    //   // this.fileMapperScheduleFormGroup.get('TimeCheck').patchValue(botSchedule.TimeCheck);
    //   let datetime = botSchedule.TimeCheck.split("T");
    //   let time = datetime[1];
    //   // console.log(datetime);
    //   // console.log(time);
    //   let hourminut = time.split(":");
    //   let hour = hourminut[0];
    //   let minut = hourminut[1];
    //   this.fileMapperScheduleFormGroup.get('hour').patchValue(hour);
    //   this.fileMapperScheduleFormGroup.get('minutes').patchValue(minut);
    //   this.fileMapperScheduleFormGroup.get('Interval').patchValue(botSchedule.Interval);
    // }
  }

  TestRunSchedule(): void {
    if (this.fileMapperScheduleFormGroup.valid) {
      if (this.currentSelectedFileMapper.MapperID) {

        const dialogConfig: MatDialogConfig = {
          data: {
            Actiontype: 'TestRun',
            Catagory: 'Bot Schedule'
          },
          panelClass: 'confirmation-dialog'
        };
        const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(
          result => {
            if (result) {
              let mapperId = this.currentSelectedFileMapper.MapperID;
              console.log(mapperId);
              this._fileMapperService.TestRun(this.currentSelectedFileMapper).subscribe(
                (data) => {
                  this.botSchedule = new BotScheduler();
                  let hour;
                  let minute;
                  let ampm;
                  hour = this.fileMapperScheduleFormGroup.get('hour').value;
                  minute = this.fileMapperScheduleFormGroup.get('minutes').value;
                  ampm = this.fileMapperScheduleFormGroup.get('AMPM').value;
                  this.botSchedule.MapperID = mapperId;

                  this.botSchedule.PostCheckType = this.fileMapperScheduleFormGroup.get('PostCheckType').value;
                  this.botSchedule.DateCheck = this.fileMapperScheduleFormGroup.get('DateCheck').value;
                  this.botSchedule.DayCheck = this.fileMapperScheduleFormGroup.get('DayCheck').value;
                  this.botSchedule.TimeCheck = hour + ':' + minute + ampm;
                  this.botSchedule.Interval = this.fileMapperScheduleFormGroup.get('Interval').value;
                  // this.botSchedule.CreatedBy = this.authenticationDetails.userID.toString();
                  console.log(this.botSchedule);
                  this._fileMapperService.ScheduleMapping(this.botSchedule).subscribe(
                    (data) => {
                      // this.notificationSnackBarComponent.openSnackBar('Bot Schedule successfully done', SnackBarStatus.success);
                      // this.SaveSucceed.emit('success');
                      // this._fileMapperService.TriggerNotification('Bot Schedule successfully done');
                      this.notificationSnackBarComponent.openSnackBar('TestRun and BotSchedule successfully done', SnackBarStatus.success);
                    },
                    (err) => {
                      console.error(err);
                      this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
                      // this.ShowProgressBarEvent.emit('hide');
                    }
                  );

                  // console.log(data);
                  this.ResetControl();
                  // this.notificationSnackBarComponent.openSnackBar('TestRun and BotSchedule successfully done', SnackBarStatus.success);
                  // this.SaveSucceed.emit('success');
                  // this._fileMapperService.TriggerNotification('TestRun and BotSchedule successfully done');

                },
                (err) => {
                  console.error(err);
                  this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
                  // this.ShowProgressBarEvent.emit('hide');
                }
              );
            }
          }
        );

      }
    } else {
      Object.keys(this.fileMapperMainFormGroup.controls).forEach(key => {
        this.fileMapperMainFormGroup.get(key).markAsTouched();
        this.fileMapperMainFormGroup.get(key).markAsDirty();
      });
    }
  }

  GetPostCheckType(postCheckType: string): void {
    // this.ResetControl();
    this.SelectPostCheckType = postCheckType;

  }

  ResetControl(): void {
    this.botSchedule = new BotScheduler();
    this.fileMapperScheduleFormGroup.reset();
    Object.keys(this.fileMapperScheduleFormGroup.controls).forEach(key => {
      // const control = this.fileMapperMainFormGroup.get(key);
      this.fileMapperScheduleFormGroup.get(key).markAsUntouched();
    });
  }
}
