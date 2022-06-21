import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Subject, BehaviorSubject } from 'rxjs';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
@Injectable({
  providedIn: 'root'
})
export class CommonService {

  localeEvent = new Subject<string>();
  lang = 'ar';
  loggedInObservable = new BehaviorSubject<boolean>(false);
  emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  maxDobDate = new Date(3600000 * Math.floor(Date.now() / 3600000));
  weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  defaultImage = "data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAA8AAD/4QORaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjYtYzEzMiA3OS4xNTkyODQsIDIwMTYvMDQvMTktMTM6MTM6NDAgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6Y2ExZjRlMTYtNGY2OC00NjU4LTg1ZTMtZTBmMDNkYzY4MDA1IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjM5QTkxMjdFMTFGOTExRTc4MkEzQkY0MDJBMEQwMzYxIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjM5QTkxMjdEMTFGOTExRTc4MkEzQkY0MDJBMEQwMzYxIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE1LjUgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDphZGNkMjMwNi00MzdlLTRlYzYtOGU3OS00YjM5NzMyMDA0NjYiIHN0UmVmOmRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDoxNmJjYWY3OS01OWI3LTExN2EtODZjYS05NThlMTNjMzU1OWEiLz4g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";

  EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  EXCEL_EXTENSION = '.xlsx';

  constructor(
    private router: Router,
    private translate: TranslateService,
  ) {
    this.setDefaultLang();
  }

  setDefaultLang() {
    this.lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : 'ar';
    localStorage.setItem('lang', this.lang);
    this.translate.setDefaultLang(this.lang);
    this.changeLang(this.lang);
  }

  changeLang(lang: string) {
    localStorage.setItem('lang', lang);
    this.translate.use(lang);
    this.localeEvent.next(lang);
  }

  setLoggedInObservable(obValue: boolean) {
    this.loggedInObservable.next(obValue);
  }

  get isloggedInObservable() {
    return this.loggedInObservable.asObservable();
  }

  isLoggedIn() {
    return this.getUserData('token') ? true : false;
  }

  setUserData(userData: any, storage_type: boolean = false) {
    localStorage.setItem('userData', JSON.stringify(userData));
  }

  getUserData(dataKey: string = '') {
    let userData = (localStorage.getItem('userData')) ? localStorage.getItem('userData') : '';
    if (dataKey != '') {
      if (userData != '') {
        let parsedUserData = JSON.parse(userData);
        return parsedUserData[dataKey];
      }
      return '';
    }
    return (userData != '') ? JSON.parse(userData) : '';
  }

  userDefaultRoute() {
    this.router.navigate(['/dashboard']);
    /* let userGroup = this.getUserData('group_name');
    if(userGroup == "Super Admin") this.router.navigate(['/dashboard']);
    if(userGroup == "Doctor") this.router.navigate(['/dashboard']);
    if(userGroup == "Patient") this.router.navigate(['/dashboard']);
    if(userGroup == "Clinic") this.router.navigate(['/dashboard']); */
  }

  queryParams(params: object) {
    let queryParams = '';
    for (const property in params) {
      queryParams += '&' + property + '=' + params[property];
    }
    return queryParams;
  }

  blood_groups() {
    return ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  }

  months() {
    let m = [
      { id: '01', month: 'January', alias: 'Jan' },
      { id: '02', month: 'February', alias: 'Feb' },
      { id: '03', month: 'March', alias: 'Mar' },
      { id: '04', month: 'April', alias: 'Apr' },
      { id: '05', month: 'May', alias: 'May' },
      { id: '06', month: 'June', alias: 'Jun' },
      { id: '07', month: 'July', alias: 'Jul' },
      { id: '08', month: 'August', alias: 'Aug' },
      { id: '09', month: 'September', alias: 'Sep' },
      { id: '10', month: 'October', alias: 'Oct' },
      { id: '11', month: 'November', alias: 'Nov' },
      { id: '12', month: 'December', alias: 'Dec' }
    ];
    return m;
  }

  years(number = 100) {
    let d = new Date();
    let n = d.getFullYear();
    let yearsArray = [];
    yearsArray.push(n);
    for (let i = 1; i <= number; i++) {
      yearsArray.push(n - i);
    }
    return yearsArray;
  }

  dateFormat(dateTimeString = '') {
    if (dateTimeString) {
      let startDate = new Date(dateTimeString); //Sun Apr 05 2020 00:00:00 GMT+0530 (India Standard Time)
      let startYear = startDate.getFullYear(), startMonth = '' + (startDate.getMonth() + 1), startDay = '' + startDate.getDate();
      if (startMonth.length < 2) startMonth = '0' + startMonth;
      if (startDay.length < 2) startDay = '0' + startDay;
      return startYear + '-' + startMonth + '-' + startDay;
    }
    return '';
  }

  dateTimeFormat(dateTimeString = '') {
    if (dateTimeString) {
      let startDate = new Date(dateTimeString); //Sun Apr 05 2020 00:00:00 GMT+0530 (India Standard Time)
      let startYear = startDate.getFullYear(),
        startMonth = '' + (startDate.getMonth() + 1),
        startDay = '' + startDate.getDate() + ' ',

        startHour = '' + startDate.getHours(),
        startMint = '' + startDate.getMinutes(),
        startSec = '' + startDate.getMinutes()

      if (startMonth.length < 2) startMonth = '0' + startMonth;
      if (startDay.length < 2) startDay = '0' + startDay;
      if (startHour.length < 2) startHour = '0' + startHour;
      if (startMint.length < 2) startMint = '0' + startMint;
      if (startSec.length < 2) startSec = '0' + startSec;

      return startYear + '-' + startMonth + '-' + startDay + '' + startHour + ':' + startMint + ':' + startSec;
    }
    return '';
  }

  fbSnapshotToArray(snapshot: any) {
    const returnArr = [];
    snapshot.forEach((childSnapshot: any) => {
      const item = childSnapshot.val();
      item.key = childSnapshot.key;
      returnArr.push(item);
    });
    return returnArr;
  };

  breakTimes(interval = 15) {
    //interval: minutes interval

    let start_time = 0; // start time
    let meridian = ['am', 'pm'];

    let t = []; // time array

    for (let i = 0; start_time < 24 * 60; i++) {
      let hour = Math.floor(start_time / 60); // getting hours of day in 0-24 format
      let minute = (start_time % 60); // getting minutes of the hour in 0-55 format
      t[i] = `${hour === 0 || hour === 12 ? '12' : (hour % 12).toString().slice(-2)}:${('0' + minute).slice(-2)} ${meridian[hour < 12 ? 0 : 1]}`;
      start_time = start_time + interval;
    }
    return t;
  }

  exportAsExcelFile(json: any[], excelFileName: string): void {

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    console.log('worksheet', worksheet);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    //const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: this.EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + this.EXCEL_EXTENSION);
  }

}
