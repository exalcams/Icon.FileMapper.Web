import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Router } from '@angular/router';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { MatSnackBar } from '@angular/material';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { AuthenticationDetails } from 'app/models/master';
import { FileMapper } from 'app/models/file-mapper';
import { FileMapperService } from 'app/services/file-mapper.service';
import { Guid } from 'guid-typescript';

@Component({
  selector: 'app-file-mapper',
  templateUrl: './file-mapper.component.html',
  styleUrls: ['./file-mapper.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class FileMapperComponent implements OnInit {
  MenuItems: string[];
  AllFileMappers: FileMapper[] = [];
  SelectedFileMapper: FileMapper;
  authenticationDetails: AuthenticationDetails;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;

  constructor(private _fileMapperService: FileMapperService, private _router: Router, public snackBar: MatSnackBar) {
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.IsProgressBarVisibile = true;
  }

  ngOnInit(): void {
    // Retrive authorizationData
    const retrievedObject = localStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.MenuItems = this.authenticationDetails.menuItemNames.split(',');
      if (this.MenuItems.indexOf('FileMapper') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger);
        this._router.navigate(['/auth/login']);
      }
      this.GetAllFileMappers();
    } else {
      this._router.navigate(['/auth/login']);
    }

  }

  GetAllFileMappers(): void {
    // var fileMapper1 = new FileMapper();
    // var guid = Guid.create();
    // fileMapper1.MapperID = guid;
    // fileMapper1.MailBox = 'ABC';
    // fileMapper1.Mode = 'Email';
    // fileMapper1.ConnectionServer = 'IMAP';
   // this.AllFileMappers.push(fileMapper1);
    this._fileMapperService.GetAllFileMappers().subscribe(
      (data) => {
        this.AllFileMappers = <FileMapper[]>data;
        this.IsProgressBarVisibile = false;
        // console.log(this.AllFileMappers);
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  OnFileMapperSelectionChanged(SelectedFileMapper: FileMapper): void {
    this.SelectedFileMapper = SelectedFileMapper;
  }

  OnShowProgressBarEvent(status: string): void {
    if (status === 'show') {
      this.IsProgressBarVisibile = true;
    } else {
      this.IsProgressBarVisibile = false;
    }

  }

  RefreshAllFileMappers(msg: string): void {
    // console.log(msg);
    this.GetAllFileMappers();
  }

}
